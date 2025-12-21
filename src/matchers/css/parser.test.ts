import { Parser } from './parser';

describe('CSS Parser', () => {
  test('test', () => {
    const parser = new Parser('.test > div');
    const parsed = parser.parse();

    expect(parsed).toBeTruthy();
  });
});
