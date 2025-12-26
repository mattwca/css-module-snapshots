import { ParsingError } from "./ParsingError";
import { Token, TokenType } from "./tokenize";

/**
 * Represents a stream of tokens for parsing, including methods to consume and peek tokens,
 * as well as state and method for managing the parsing position.
 */
export class TokenStream {
  public position: number;
  public positionStack: number[];

  constructor (private tokens: Token[]) {
    this.position = 0;
    this.positionStack = [];
  }

  /**
   * Peeks at the next token in the stream, without consuming it.
   * @returns The next token, or null if we're at the end of the stream.
   */
  public peek(): Token | null {
    return this.tokens[this.position] || null;
  }

  /**
   * Consumes and returns the next token in the stream.
   * @returns The consumed token, or null if we're at the end of the stream.
   */
  public consume(): Token | null {
    return this.tokens[this.position++] || null;
  }

  /**
   * Consumes a token if it matches the expected type.
   * @returns The consumed token, or null if the next token does not match the expected type.
   */
  public consumeIf(type: TokenType): Token | null {
    const token = this.peek();
    if (token?.type === type) {
      return this.consume();
    }
    return null;
  }

  /**
   * Consumes a token matching one of the expected types.
   * @returns The consumed token.
   * @throws {ParsingError} If the next token does not match any of the expected types.
   */
  public consumeExpect(...types: TokenType[]): Token {
    const token = this.consume();

    if (!token || !types.includes(token.type)) {
      throw new ParsingError(`Expected token of type ${types.join(', ')}, but got ${token?.type || 'end of input'}`);
    }

    return token;
  }

  /**
   * Consumes a whitespace token.
   */
  public eatWhitespace() {
    this.consumeIf('whitespace');
  }

  /**
   * Stores the current position in the position stack.
   */
  public storePosition() {
    this.positionStack.push(this.position);
  }

  /**
   * Clears the last stored position without restoring it.
   */
  public clearPosition() {
    this.positionStack.pop();
  }

  /**
   * Restores the last stored position from the position stack.
   */
  public restorePosition() {
    const pos = this.positionStack.pop();
    if (pos !== undefined) {
      this.position = pos;
    }
  }

  /**
   * Expects the end of input, throwing an error if not.
   * @throws {ParsingError} If the end of the input has not been reached.
   */
  public expectEndOfInput() {
    // Consume any trailing whitespace.
    this.eatWhitespace();

    if (this.peek() !== null) {
      throw new ParsingError(`Expected end of input, but got token of type ${this.peek()!.type}`);
    }
  }

  public peekRemainder(): string {
    return this.tokens.slice(this.position).map(t => t.value).join('');
  }
}