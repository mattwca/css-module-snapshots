import { AttributeSelectorNode, CombinatorNode, CompoundSelectorNode, Expression, SelectorNode, StringNode } from "./ast";
import { ParsingError } from "./ParsingError";
import { tokenize } from "./tokenize";
import { TokenStream } from "./TokenStream";
import { TryParseResult, unwrapResult, unwrapResultOrThrow } from "./TryParseResult";
import { Token, TokenType } from "./types";

/**
 * Backtracking parser for CSS selectors, implemented using combinators, utilises a TokenStream to read tokens and build an AST.
 */
export class Parser {
  /**
   * The stream of tokens from the input selector string.
   */
  private tokenStream: TokenStream;

  /**
   * The deepest parsing error encountered during parsing.
   * 
   * Used to track the most relevant error to report back to the user.
   */
  private deepestError: ParsingError | null;

  /**
   * Creates a new CSS selector parser instance.
   * @param selector The CSS selector string to parse.
   */
  constructor(selector: string) {
    this.tokenStream = new TokenStream(tokenize(selector));
    this.deepestError = null;
  }

  private onErrorRaised(error: ParsingError) {
    if (!!this.deepestError && this.deepestError.location.position > error.location.position) {
      return;
    }

    this.deepestError = error;
  }

  // === Combinator Parsing Helpers ===

  /**
   * Attempts to parse using the provided parse function. If the parsing fails, the token stream is reset to its original state.
   * Foundation for implementing backtracking in the parser.
   * @return {TryParseResult<T>} The result of the parsing attempt, including any errors encountered.
   * @typeParam T The type of the parsing result.
   */
  private tryParse<T>(parseFn: () => T): TryParseResult<T> {
    this.tokenStream.storePosition();

    try {
      const { result, errors } = unwrapResult<T>(parseFn());
      this.tokenStream.clearPosition();

      return {
        errors: [],
        result,
      };
    } catch (err: ParsingError | any) {
      this.tokenStream.restorePosition();

      // If this is the deepest error so far (parser that made it to the furthest point), we store it in the parser
      // state for later reporting.
      this.onErrorRaised(err);

      return {
        errors: [err],
        result: null,
      };
    }
  }

  /**
   * Tries to parse using a given set of parsers, returning the first successful result, if any.
   * @return {TryParseResult<T>} The result of the parsing attempt, including accumulated errors encountered.
   * @typeParam T The type of the parsing result.
   */
  private tryParseMultiple<T>(...parseFns: (() => T)[]): TryParseResult<T> {
    const totalErrors: ParsingError[] = [];

    for (const parseFn of parseFns) {
      const { result, errors } = this.tryParse(parseFn);

      if (result !== null) {
        return { result, errors: [] };
      }

      totalErrors.push(...errors);
    }

    return { result: null, errors: totalErrors };
  }

  /**
   * Tries to repeatedly parse with the given parsing function, until it fails.
   * @return {TryParseResult<T[]>} The result of the parsing attempt, including accumulated errors encountered.
   * @typeParam T The type of the parsing result.
   */
  private tryParseUntil(parseFn: (() => any)): TryParseResult<any[]> {
    const totalErrors: ParsingError[] = [];
    const results: any[] = [];

    let count = 0;

    while (true) {
      const { result, errors } = this.tryParse(parseFn);

      if (result === null) {
        totalErrors.push(...errors);
        break;
      }

      results.push(result);
    }

    return {
      errors: results.length === 0 ? totalErrors : [],
      result: results,
    };
  }

  /**
   * Combines two parsing functions into one, returning a tuple of their results.
   * @return {() => [T, U]} A new parsing function that returns a tuple of the results from the two input parsing functions.
   * @typeParam T The type of the first parsing result.
   * @typeParam U The type of the second parsing result.
   * @throws {ParsingError} If either of the parsing functions fail.
   */
  private and<T, U>(parseFn1: () => T, parseFn2: () => U): () => [T, U] {
    return () => {
      const result1 = parseFn1();
      const result2 = parseFn2();

      return [result1, result2];
    };
  }

  // /**
  //  * Parses a number from the token stream.
  //  */
  // private parseNumber(): number {
  //   let value = '';
  //   let token: Token | null;

  //   while (token = this.tokenStream.peek()) {
  //     if (token.type !== 'digit') {
  //       break;
  //     }

  //     const next = this.tokenStream.consume();
  //     value += next?.value;
  //   }

  //   return Number(value);
  // }

  // === Selectors ===

  /**
   * Tries to parse a valid CSS name (identifier) from the token stream.
   */
  private parseName(): SelectorNode {
    let value = '';
    let token: Token | null;

    const validTokenTypes: TokenType[] = ['letter', 'digit', 'minus', 'underscore'];
    value += this.tokenStream.consumeExpect('letter').value;

    while (token = this.tokenStream.peek()) {
      if (!validTokenTypes.includes(token.type)) {
        break;
      }

      const next = this.tokenStream.consume();
      value += next?.value;
    }

    return {
      type: 'Selector',
      value,
    }
  }

  /**
   * Parses an ID selector from the token stream.
   */
  private parseIdentifier(): SelectorNode {
    this.tokenStream.consumeExpect('hash');
    let { value: name } = this.parseName();

    return {
      type: 'Selector',
      value: `#${name}`,
    }
  }

  /**
   * Parses a class selector from the token stream.
   */
  private parseClass(): SelectorNode {
    this.tokenStream.consumeExpect('period');
    let { value: className } = this.parseName();

    return {
      type: 'Selector',
      value: `.${className}`,
    }
  }

  private parseString(): StringNode {
    let value = '';

    value += this.tokenStream.consumeExpect('quote').value;

    while (true) {
      const next = this.tokenStream.consume();
      if (next === null) {
        throw new ParsingError('Unterminated string literal', this.tokenStream.getPositionForError());
      }

      if (next.type === 'quote') {
        value += next.value;
        break;
      }

      value += next.value;
    }

    return {
      type: 'String',
      value,
    };
  }

  private parseExpression(): Expression {
    const attribute = this.parseName();

    const parseComplexExpressionParts = () => {
      this.tokenStream.eatWhitespace();

      let operator = this.tokenStream.consumeIf('tilde', 'pipe', 'caret', 'dollar', 'asterisk')?.value || '';
      operator += this.tokenStream.consumeExpect('equals').value;

      this.tokenStream.eatWhitespace();

      const value = unwrapResultOrThrow(
        this.tryParseMultiple<StringNode | SelectorNode>(this.parseString.bind(this), this.parseName.bind(this)),
        this.tokenStream.getPositionForError(),
        'Expected string or name as attribute selector value'
      );

      return {
        operator,
        value,
      }
    };

    const complexPartsResult = this.tryParse(parseComplexExpressionParts);

    return {
      type: 'Expression',
      attribute,
      ...complexPartsResult.result,
    };
  }

  private parseAttributeSelector(): AttributeSelectorNode {
    this.tokenStream.consumeExpect('left_bracket').value;

    const expression = this.parseExpression();
    this.tokenStream.consumeExpect('right_bracket').value;

    return {
      type: 'AttributeSelector',
      expression,
    };
  }

  /**
   * Parses a single CSS selector from the token stream.
   */
  private parseSelector(): SelectorNode | AttributeSelectorNode {
    const result = this.tryParseMultiple<SelectorNode | AttributeSelectorNode>(
      this.parseIdentifier.bind(this),
      this.parseClass.bind(this),
      this.parseName.bind(this),
      this.parseAttributeSelector.bind(this)
    );

    return unwrapResultOrThrow(result, this.tokenStream.getPositionForError());
  }

  /**
   * Parses a compound CSS selector (one or more selectors not separated by a combinator) from the token stream.
   */
  private parseCompoundSelector(): CompoundSelectorNode {
    const result = this.tryParseUntil(this.parseSelector.bind(this));

    const selectors = unwrapResultOrThrow(result, this.tokenStream.getPositionForError(), 'Expected at least one selector');

    const node: CompoundSelectorNode = {
      type: 'CompoundSelector',
      selectors,
    }

    return node;
  }

  // === CSS Combinators ===

  private parseDescendantCombinator(): CombinatorNode {
    const left = this.parseCompoundSelector();
    const operator = this.tokenStream.consumeExpect('whitespace');
    const right = this.parseComplexSelector();

    return {
      type: 'Combinator',
      operator,
      left,
      right,
    }
  }

  private parseOtherCombinator(): CombinatorNode {
    const left = this.parseCompoundSelector();
    this.tokenStream.eatWhitespace();

    const validCombinators: TokenType[] = ['left_angle_bracket', 'plus', 'tilde'];
    const operator = this.tokenStream.consumeExpect(...validCombinators);

    this.tokenStream.eatWhitespace();
    const right = this.parseComplexSelector();

    return {
      type: 'Combinator',
      operator,
      left,
      right,
    }
  }

  /**
   * Parses a complex CSS selector, which may include combinators, from the token stream.
   */
  private parseComplexSelector(): CombinatorNode | CompoundSelectorNode | SelectorNode | AttributeSelectorNode {
    const tryParseResult = this.tryParseMultiple<CombinatorNode | CompoundSelectorNode | SelectorNode | AttributeSelectorNode>(
      this.parseOtherCombinator.bind(this),
      this.parseDescendantCombinator.bind(this),
      this.parseCompoundSelector.bind(this),
    )!;

    const selector = unwrapResultOrThrow(tryParseResult, this.tokenStream.getPositionForError());
    return selector;
  }

  // == Entry Point ==

  public parse() {
    try {
      const test = this.parseComplexSelector();
      this.tokenStream.expectEndOfInput();
      return test;
    } catch (err: ParsingError | any) {
      if (err instanceof ParsingError) {
        if (this.deepestError && this.deepestError.location.position > err.location.position) {
          throw this.deepestError;
        }
      }

      throw err;
    }
  }
}