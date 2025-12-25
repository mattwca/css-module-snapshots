import { CombinatorNode, SelectorListNode, SelectorNode } from "./ast";
import { ParsingError } from "./ParsingError";
import { Token, tokenize, TokenType } from "./tokenize";
import { TokenStream } from "./TokenStream";

type TryParseResult<T> = {
  errors: ParsingError[];
  result: T | null;
}

const isTryParseResult = <T>(obj: any): obj is TryParseResult<T> => {
  return obj && typeof obj === 'object' && 'errors' in obj && 'result' in obj;
};

const unwrapResult = <T>(tryParseResult: T | TryParseResult<T>): TryParseResult<T> => {
  let result: T | null, errors: ParsingError[];

  if (isTryParseResult(tryParseResult)) {
    result = tryParseResult.result;
    errors = tryParseResult.errors;
  } else {
    result = tryParseResult as T;
    errors = [];
  }

  return { result, errors };
};

export class Parser {
  private tokenStream: TokenStream;
  private positionStack: number[];

  constructor(selector: string) {
    this.tokenStream = new TokenStream(tokenize(selector));
    this.positionStack = [];
  }

  /**
   * Attempts to parse using the provided parse function.
   * 
   * If the parse fails, the token stream is reset to its original state.
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
      console.log(`[tryParse] caught error: ${err.message}`);

      this.tokenStream.restorePosition();

      return {
        errors: [err.message],
        result: null,
      };
    }
  }

  /**
   * Tries to parse using a given set of parsers, returning the first successful result.
   */
  private tryParseMultiple<T>(...parseFns: (() => T)[]): TryParseResult<T> {
    const totalErrors: ParsingError[] = [];

    for (const parseFn of parseFns) {
      const { result, errors } = this.tryParse(parseFn);

      // console.log(`[tryParseMultiple] errors=${JSON.stringify(errors)}`);

      if (result !== null) {
        return { result, errors: [] };
      }

      totalErrors.push(...errors);
    }

    return { result: null, errors: totalErrors };
  }

  /**
   * Tries to parse using a given parser, until it fails.
   */
  private tryParseUntil(parseFn: (() => any)): TryParseResult<any[]> {
    const totalErrors: ParsingError[] = [];
    const results: any[] = [];

    let count = 0;

    while (true) {
      const { result, errors } = this.tryParse(parseFn);

      console.log(`[tryParseUntil] errors=${JSON.stringify(errors)}`);

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
   * Parses a number from the token stream.
   */
  private parseNumber(): number {
    let value = '';
    let token: Token | null;

    while (token = this.tokenStream.peek()) {
      if (token.type !== 'digit') {
        break;
      }
      
      const next = this.tokenStream.consume();
      value += next?.value;
    }

    return Number(value);
  }

  /**
   * Tries to parse a valid CSS name (identifier) from the token stream.
   */
  private parseName(): string {
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

    return value;
  }

  /**
   * Parses an ID selector from the token stream.
   */
  private parseIdentifier(): string {
    let value = '';

    value += this.tokenStream.consumeExpect('hash').value;
    value += this.parseName();

    return value;
  }

  /**
   * Parses a class selector from the token stream.
   */
  private parseClass() {
    let value = '';

    value += this.tokenStream.consumeExpect('period').value;
    value += this.parseName();

    return value;
  }

  /**
   * Parses a single CSS selector from the token stream.
   */
  private parseSelector(): TryParseResult<SelectorNode> | null {
    const { result, errors } = this.tryParseMultiple(
      this.parseIdentifier.bind(this),
      this.parseClass.bind(this),
      this.parseName.bind(this),
    )

    // console.log(`[parseSelector] result=${JSON.stringify(result)}`);
    console.log(`[parseSelector] errors=${JSON.stringify(errors)}`);

    if (result === null) {
      return { result, errors };
    }

    return {
      errors: [],
      result : {
      type: 'Selector',
      value: result!,
      },
    };
  }

  /**
   * Parses a list of CSS selectors from the token stream.
   */
  private parseSelectors(): SelectorListNode {
    const { result, errors } = this.tryParseUntil(this.parseSelector.bind(this));

    console.log(`[parseSelectors] errors=${JSON.stringify(errors)}`);

    if (result === null || result.length === 0) {
      throw new ParsingError('Expected at least one selector');
    }

    const node: SelectorListNode = {
      type: 'SelectorList',
      selectors: result,
    }

    return node;
  }

  private parseDescendantCombinator(): CombinatorNode | null {
    const left = this.parseSelectors();
    const operator = this.tokenStream.consumeExpect('whitespace');
    const right = this.parseCombinator();

    return {
      type: 'Combinator',
      operator,
      left,
      right,
    }
  }

  private parseOtherCombinator(): CombinatorNode | null {
    const left = this.parseSelectors();
    this.tokenStream.eatWhitespace();

    const validCombinators: TokenType[] = ['left_angle_bracket', 'plus', 'tilde'];    
    const operator = this.tokenStream.consumeExpect(...validCombinators);

    this.tokenStream.eatWhitespace();
    const right = this.parseCombinator();

    return {
      type: 'Combinator',
      operator,
      left,
      right,
    }
  }

  private parseCombinator(): CombinatorNode | SelectorListNode {
    const { result, errors } = this.tryParseMultiple<CombinatorNode | SelectorListNode | null>(
      this.parseOtherCombinator.bind(this),
      this.parseDescendantCombinator.bind(this),
      this.parseSelectors.bind(this),
    )!;

    console.log(`[parseCombinator] result=${JSON.stringify(result)}, errors=${JSON.stringify(errors)}`);

    if (result === null) {
      throw new ParsingError('Failed to parse combinator: ' + errors.map(e => e.message).join('; '));
    }

    return result;
  }

  public parse() {
    const test = this.parseCombinator();

    this.tokenStream.eatWhitespace();

    this.tokenStream.expectEndOfInput();

    console.log(JSON.stringify(test));

    return test;
  }
}