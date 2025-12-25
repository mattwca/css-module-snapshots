import { Parser } from './Parser';

describe('CSS Parser', () => {
  test('test', () => {
    const parser = new Parser('.test #shit >');
    const parsed = parser.parse();

    expect(parsed).toBeTruthy();
  });
});