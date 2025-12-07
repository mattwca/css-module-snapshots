import type { MatcherFunction } from 'expect';

import { CSSModuleSnapshotsContext } from './context';

export const toHaveCssStyle: MatcherFunction<[expectedStyles: Record<string, string | number>]> = function (actual, expectedStyles) {
  if (!(actual instanceof HTMLElement)) {
    throw new Error(`[toHaveCssStyle] Expected a HTMLElement, received ${actual}`)
  }

  CSSModuleSnapshotsContext.instance.addStylesheetsToContext();

  const styleDefinitions = CSSModuleSnapshotsContext.instance.styleRules;
  const matchingStyleDefinitions = styleDefinitions.filter((definition) => definition.selectors.some((selector) => actual.matches(selector)));

  // Find all style rules that match one of the expected style properties. Essentially, we go through each style definition (which contains
  // a selector that matches the current element), and find any rule declarations that match one of the expected style properties.
  // const matchingStyleRules = matchingStyleDefinitions.flatMap((definition) => {
  //   definition.declarations.filter((declaration) => declaration.type === 'declaration' && 
  // });

  console.log('Matching Style Definitions:', matchingStyleDefinitions);

  return {
    message: () => 'This is a test response',
    pass: true,
  };
};