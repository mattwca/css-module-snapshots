declare global {
  namespace jest {
    interface Matchers<R, T = {}> {
      /**
       * Checks if the given HTMLElement has the expected CSS styles applied.
       * 
       * Note that this check does not account for CSS specificity or inheritance; it simply checks whether
       * any of the style rules that match the element contain one or more of the expected properties.
       * 
       * @param expectedStyles The expected style properties.
       */
      toHaveCssStyle(expectedStyles: Partial<CSSStyleDeclaration>): R;
    }
  }
}

export {};