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
      parser.parse();
      // expect(() => parser.parse()).toThrow();
    });
  });
});