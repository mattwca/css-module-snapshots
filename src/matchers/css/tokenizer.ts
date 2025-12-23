export type TokenType = 'letter'
  | 'whitespace'
  | 'digit'
  | 'left_bracket'
  | 'right_bracket'
  | 'left_paren'
  | 'right_parent'
  | 'colon'
  | 'period'
  | 'hash'
  | 'asterisk'
  | 'equals'
  | 'quote'
  | 'tilde'
  | 'left_angle_bracket'
  | 'right_angle_bracket'
  | 'dollar'
  | 'caret'
  | 'pipe'
  | 'comma'
  | 'plus'
  | 'minus'
  | 'underscore'
  | 'other';

export type Token = {
  value: string;
  type: TokenType;
}

const letterRegex = /[a-zA-Z]/;
const digitRegex = /[0-9]/;
const whitespaceRegex = /\s/;

export const tokenize = (selector: string): Token[] => {
  return selector.split('').reduce<Token[]>((tokens, char) => {
    if (letterRegex.test(char)) {
      tokens.push({ type: 'letter', value: char });
    } else if (digitRegex.test(char)) {
      tokens.push({ type: 'digit', value: char });
    } else if (whitespaceRegex.test(char)) {
      tokens.push({ type: 'whitespace', value: char });
    } else {
      switch (char) {
        case '[':
          tokens.push({ type: 'left_bracket', value: char });
          break;
        case ']':
          tokens.push({ type: 'right_bracket', value: char });
          break;
        case '(':
          tokens.push({ type: 'left_paren', value: char });
          break;
        case ')':
          tokens.push({ type: 'right_parent', value: char });
          break;
        case ':':
          tokens.push({ type: 'colon', value: char });
          break;
        case '.':
          tokens.push({ type: 'period', value: char });
          break;
        case '#':
          tokens.push({ type: 'hash', value: char });
          break;
        case '*':
          tokens.push({ type: 'asterisk', value: char });
          break;
        case '=':
          tokens.push({ type: 'equals', value: char });
          break;
        case '"':
        case "'":
          tokens.push({ type: 'quote', value: char });
          break;
        case '~':
          tokens.push({ type: 'tilde', value: char });
          break;
        case '>':
          tokens.push({ type: 'left_angle_bracket', value: char });
          break;
        case '<':
          tokens.push({ type: 'right_angle_bracket', value: char });
          break;
        case '$':
          tokens.push({ type: 'dollar', value: char });
          break;
        case '^':
          tokens.push({ type: 'caret', value: char });
          break;
        case '|':
          tokens.push({ type: 'pipe', value: char });
          break;
        case ',':
          tokens.push({ type: 'comma', value: char });
          break;
        case '-':
          tokens.push({ type: 'minus', value: char });
          break;
         case '+':
          tokens.push({ type: 'plus', value: char });
          break;
        case '_':
          tokens.push({ type: 'underscore', value: char });
          break;
        default:
          tokens.push({ type: 'other', value: char });
          break;
      }
    }

    return tokens;
  }, []);
}
