import type { MatcherFunction } from 'expect';

import { CSSModuleSnapshotsContext } from './context';

const kebabCaseToCamelCase = (str: string) => {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

export const toHaveCssStyle: MatcherFunction<[expectedStyles: Record<string, string | number>]> = function (actual, expectedStyles) {
  if (!(actual instanceof HTMLElement)) {
    return {
      message: () => `Expected a HTMLElement, received ${actual}`,
      pass: false
    }
  }

  if (Object.entries(expectedStyles).length === 0) {
    return {
      message: () => 'Expected at least one style property to check against',
      pass: false
    }
  }

  CSSModuleSnapshotsContext.instance.addStylesheetsToContext();

  const styleRules = CSSModuleSnapshotsContext.instance.styleRules;
  const matchingStyleRules = styleRules.filter((rule) => rule.selectors.some((selector) => actual.matches(selector)));

  // Find whether there is a style rule that matches one of the expected style properties.
  const hasMatchingStyleRule = Object.entries(expectedStyles).every(([property, value]) => {
    return matchingStyleRules.some((rule) => {
      const propertyDeclarations = rule.declarations.filter((declaration) => declaration.type === 'declaration' );
      return propertyDeclarations.some((declaration) => {
        const camelCaseProperty = kebabCaseToCamelCase(declaration.property);
        return camelCaseProperty === property && declaration.value === value.toString();
      });
    });
  });


  return {
    message: () => hasMatchingStyleRule ? '' : `Expected element to have CSS styles: ${JSON.stringify(expectedStyles)}`,
    pass: hasMatchingStyleRule
  };
};