declare global {
  namespace jest {
    interface Matchers<R, T = {}> {
      toHaveCssStyle(expectedStyles: Record<string, string | number>): R;
    }
  }
}

export {};