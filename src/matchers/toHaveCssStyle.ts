import type { MatcherFunction } from 'expect';

import { CSSModuleSnapshotsContext } from './context';
import { SpecificityCalculator } from './css/SpecificityCalculator';
import { StylesheetRule } from './context/Stylesheet';

type UnmatchedProperties = {
  property: string;
  value: string | number;
}

const camelCaseToKebabCase = (str: string) => {
  return str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
};

const generateMessage = (unmatchedProperties: UnmatchedProperties[]) => {
  if (unmatchedProperties.length === 0) {
    return '';
  }

  const propertiesFormatted = unmatchedProperties.reduce((str, { property, value }) => {
    return `${str}\n  ${property}: ${value};`;
  }, '')

  const result = `Element does not have the following expected styles: ${propertiesFormatted}`;
  return result;
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
  styleRules.forEach((rule) => {
    rule.selectorParts.forEach((part) => {
      const specificityCalculator = new SpecificityCalculator(part);
      specificityCalculator.calculate();
    })
  });

  const matchingStyleRules = styleRules.reduce((rules, rule) => {
    const matchingParts = rule.selectorParts.filter((part) => actual.matches(part));

    rules.push(...matchingParts.map((part) => ({
      part,
      rule
    })));
    return rules;
  }, [] as { part: string; rule: StylesheetRule }[]);

  const unmatchedProperties: { property: string; value: string | number }[] = [];

  // Find whether there is a style rule that matches each of the expected style properties.
  const hasMatchingStyleRule = Object
    .entries(expectedStyles)
    .every(([property, value]) => {
      const isMatched = matchingStyleRules.some(({ part, rule }) => {
        // Get only property declarations (ignore comments, etc).
        const propertyName = camelCaseToKebabCase(property);
        return rule.declarations[propertyName] && rule.declarations[propertyName] === value.toString();
      });

      if (!isMatched) {
        unmatchedProperties.push({ property, value });
      }

      return isMatched;
    });

  return {
    message: () => generateMessage(unmatchedProperties),
    pass: hasMatchingStyleRule
  };
};