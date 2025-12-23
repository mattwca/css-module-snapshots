import { CombinatorNode, SelectorListNode, SelectorNode } from "./ast";
import { Token, tokenize, TokenType } from "./tokenizer";

class ParsingError extends Error {
  constructor(message: string) {
    super(`Parsing Error: ${message}`);
  }
}

class TokenStream {
  public position: number;

  constructor (private tokens: Token[]) {
    this.position = 0;
  }

  public peek(): Token | null {
    return this.tokens[this.position] || null;
  }

  public consume(): Token | null {
    return this.tokens[this.position++] || null;
  }

  public consumeIf(type: TokenType): Token | null {
    const token = this.peek();
    if (token?.type === type) {
      return this.consume();
    }
    return null;
  }

  public consumeExpect(...types: TokenType[]): Token {
    const token = this.consume();

    if (!token || !types.includes(token.type)) {
      throw new ParsingError(`Expected token of type ${types.join(', ')}, but got ${token?.type || 'end of input'}`);
    }

    return token;
  }

  public eatWhitespace() {
    while (this.peek()?.type === 'whitespace') {
      this.consume();
    }
  }

  public setPosition(position: number) {
    this.position = position;
  }
}

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
  private tryParse(parseFn: () => any) {
    this.positionStack.push(this.tokenStream.position);

    try {
      const result = parseFn();
      this.positionStack.pop();
      return result;
    } catch (err) {
      this.tokenStream.setPosition(this.positionStack.pop()!);
      return null;
    }
  }

  /**
   * Tries to parse using a given set of parsers, returning the first successful result.
   */
  private tryParseMultiple(...parseFns: (() => any)[]) {
    for (const parseFn of parseFns) {
      const result = this.tryParse(parseFn);
      if (result !== null) {
        return result;
      }
    }

    return null;
  }

  /**
   * Tries to parse using a given set of parsers, until none of them succeed.
   */
  private tryParseUntil(parseFn: (() => any)) {
    const results: any[] = [];

    while (true) {
      const result = this.tryParse(parseFn);

      if (result === null) {
        break;
      }

      results.push(result);
    }

    return results;
    
    // while (true) {
      // const result = parseFns.some((fn) => {
      //   try {
      //     return fn();
      //   } catch (err) {
      //     // Ignore errors
      //     return null;
      //   }
      // });

      // console.log(result);

      
    //   console.log(JSON.stringify(result));
    //   break;

    //   if (result === null) {
    //     break;
    //   }

    //   results.push(result);
    // }
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
  private parseSelector(): SelectorNode | null {
    const result = this.tryParseMultiple(
      this.parseIdentifier.bind(this),
      this.parseClass.bind(this),
      this.parseName.bind(this),
    )

    console.log('parsed selector:', result);

    if (result === null) {
      console.log(`position = ${JSON.stringify(this.tokenStream.peek())}`);
    }

    if (result === null) {
      return null;
    }

    return {
      type: 'Selector',
      value: result!,
    }
  }

  /**
   * Parses a list of CSS selectors from the token stream.
   */
  private parseSelectors(): SelectorListNode {
    const selectors = this.tryParseUntil(this.parseSelector.bind(this));

    return {
      type: 'SelectorList',
      selectors,
    };
  }

  private parseDescendantCombinator(): CombinatorNode | null {
    console.log('parsing descendant combinator');

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
    console.log('parsing other combinator');
    const left = this.parseSelectors();

    console.log(`[parseOtherCombinator] left: ${JSON.stringify(left)}`);
    console.log(`[parseOtherCombinator] position before eating whitespace: ${JSON.stringify(this.tokenStream.peek())}`);
    
    this.tokenStream.eatWhitespace();

    const validCombinators: TokenType[] = ['left_angle_bracket', 'plus', 'tilde'];
    
    const operator = this.tokenStream.consumeExpect(...validCombinators);

    console.log('parsing combinator, operator:', operator);

    this.tokenStream.eatWhitespace();

    const right = this.parseCombinator();

    return {
      type: 'Combinator',
      operator,
      left,
      right,
    }
  }

  private parseCombinator(): CombinatorNode {
    return this.tryParseMultiple(
      this.parseOtherCombinator.bind(this),
      this.parseDescendantCombinator.bind(this),
      this.parseSelectors.bind(this),
    )!;
  }

  public parse() {
    // const test = this.tryParseMultiple(
    //   this.parseIdentifier.bind(this),
    //   this.parseNumber.bind(this),
    //   this.parseClass.bind(this),
    //   this.parseTypeSelector.bind(this),
    // );

    // this.parseCombinator();

    const test = this.parseCombinator();

    console.log(JSON.stringify(test));

    return test;
  }
}

// .this-is-a-class #id[attr="value"]::after:hover div > span + p ~ a:first-child

// CSS selector that uses all possible syntax features
// div.class1.class2#id[attr="value"]:hover::after > span + p ~ a:first-child
