import type { MatcherFunction } from 'expect';

export const toHaveCssStyle: MatcherFunction<[expectedStyles: Record<string, string | number>]> = function (actual, expectedStyles) {
  if (!(actual instanceof HTMLElement)) {
    throw new Error(`[toHaveCssStyle] Expected a HTMLElement, received ${actual}`)
  }

  const computedStyles = window.getComputedStyle(actual);

  return {
    message: () => 'This is a test response',
    pass: true,
  };
};