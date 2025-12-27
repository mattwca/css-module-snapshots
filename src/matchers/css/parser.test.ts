import { Parser } from './Parser';

describe('CSS Parser', () => {
  describe('complex combinator', () => {
    test('test successful', () => {
      const parser = new Parser('#test[data-testid="value"] > p.example[data-role="main"]');
      const parsed = parser.parse();
      expect(parsed).toBeDefined();
    });

    test('test failure', () => {
      const parser = new Parser('#test[data-testid="value" > p.example[data-role="main"]'); // Missing closing bracket
      expect(() => parser.parse()).toThrow('Parsing Error [1:28]: Expected token of type right_bracket, but got whitespace');
    });

    test('another failure', () => {
      const parser = new Parser('div[data-testid="this is unterminated"] + div.example[d=');
      expect(() => parser.parse()).toThrow('Parsing Error [1:57]: Expected token of type letter, but got end of input');
    })
  });

  describe('attribute selector', () => {
    test('simple attribute selector', () => {
      const parser = new Parser('div[title]');
      const parsed = parser.parse();

      expect(parsed).toBeDefined();
    });

    test('attribute selector with operator and value', () => {
      const parser = new Parser('div[class^="header"]');
      const parsed = parser.parse();

      expect(parsed).toBeDefined();
    });
  });
});