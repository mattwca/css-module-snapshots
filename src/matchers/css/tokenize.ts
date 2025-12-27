import { Token } from "./types";

const letterRegex = /[a-zA-Z]/;
const digitRegex = /[0-9]/;
const whitespaceRegex = /\s+/;
const newLineRegex = /\n/;

export const tokenize = (selector: string): Token[] => {
  const position = {
    line: 1,
    column: 1,
  }

  return selector.split('').reduce<Token[]>((tokens, char) => {
    position.column += 1;

    if (letterRegex.test(char)) {
      tokens.push({ type: 'letter', value: char, position });
    } else if (digitRegex.test(char)) {
      tokens.push({ type: 'digit', value: char, position });
    } else if (whitespaceRegex.test(char)) {
      if (newLineRegex.test(char)) {
        position.line += 1;
        position.column = 1;
      }

      tokens.push({ type: 'whitespace', value: char, position });
    } else {
      switch (char) {
        case '[':
          tokens.push({ type: 'left_bracket', value: char, position });
          break;
        case ']':
          tokens.push({ type: 'right_bracket', value: char, position });
          break;
        case '(':
          tokens.push({ type: 'left_paren', value: char, position });
          break;
        case ')':
          tokens.push({ type: 'right_parent', value: char, position });
          break;
        case ':':
          tokens.push({ type: 'colon', value: char, position });
          break;
        case '.':
          tokens.push({ type: 'period', value: char, position });
          break;
        case '#':
          tokens.push({ type: 'hash', value: char, position });
          break;
        case '*':
          tokens.push({ type: 'asterisk', value: char, position });
          break;
        case '=':
          tokens.push({ type: 'equals', value: char, position });
          break;
        case '"':
        case "'":
          tokens.push({ type: 'quote', value: char, position });
          break;
        case '~':
          tokens.push({ type: 'tilde', value: char, position });
          break;
        case '>':
          tokens.push({ type: 'left_angle_bracket', value: char, position });
          break;
        case '<':
          tokens.push({ type: 'right_angle_bracket', value: char, position });
          break;
        case '$':
          tokens.push({ type: 'dollar', value: char, position });
          break;
        case '^':
          tokens.push({ type: 'caret', value: char, position });
          break;
        case '|':
          tokens.push({ type: 'pipe', value: char, position });
          break;
        case ',':
          tokens.push({ type: 'comma', value: char, position });
          break;
        case '-':
          tokens.push({ type: 'minus', value: char, position });
          break;
         case '+':
          tokens.push({ type: 'plus', value: char, position });
          break;
        case '_':
          tokens.push({ type: 'underscore', value: char, position });
          break;
        default:
          tokens.push({ type: 'other', value: char, position });
          break;
      }
    }

    return tokens;
  }, []);
}
