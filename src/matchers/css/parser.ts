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

  constructor(private selector: string) {
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

  private tryParseMultiple(...parseFns: (() => any)[]) {
    for (const parseFn of parseFns) {
      const result = this.tryParse(parseFn);
      if (result !== null) {
        return result;
      }
    }

    return null;
  }

  private parseNumber() {
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

  private parseName() {
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

  private parseIdentifier() {
    let value = '';

    value += this.tokenStream.consumeExpect('hash').value;
    value += this.parseName();

    return value;
  }

  private parseClass() {
    let value = '';

    value += this.tokenStream.consumeExpect('period').value;
    value += this.parseName();

    return value;
  }

  private parseTypeSelector() {
    this.parseName();
  }

  private parseCombinator() {
    this.tokenStream.eatWhitespace();
    const result = this.tryParseMultiple(this.parseIdentifier.bind(this), this.parseClass.bind(this), this.parseTypeSelector.bind(this));
    this.tokenStream.eatWhitespace();

    const validOperators: TokenType[] = ['plus', 'left_angle_bracket', 'tilde'];
    this.tokenStream.consumeExpect(...validOperators);
  }

  public parse() {
    // const test = this.tryParseMultiple(
    //   this.parseIdentifier.bind(this),
    //   this.parseNumber.bind(this),
    //   this.parseClass.bind(this),
    //   this.parseTypeSelector.bind(this),
    // );

    this.parseCombinator();

    console.log(test);

    return test;
  }
}

// .this-is-a-class #id[attr="value"]::after:hover div > span + p ~ a:first-child

// CSS selector that uses all possible syntax features
// div.class1.class2#id[attr="value"]:hover::after > span + p ~ a:first-child
