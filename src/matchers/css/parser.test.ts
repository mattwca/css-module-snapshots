import { Parser } from './parser';

describe('CSS Parser', () => {
  test('test', () => {
    const parser = new Parser('.test > div + span ~ a foo +');
    const parsed = parser.parse();

    expect(parsed).toBeTruthy();
  });
});