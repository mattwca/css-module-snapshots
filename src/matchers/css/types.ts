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

export type TokenPosition = {
  line: number;
  column: number;
}

export type Token = {
  value: string;
  type: TokenType;
  position: TokenPosition;
}

export type ParsingErrorPosition = {
  line?: number;
  column?: number;
  position: number;
}