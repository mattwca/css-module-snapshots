import css, { CssRuleAST, CssStylesheetAST } from '@adobe/css-tools';

/**
 * Singleton context for the CSS module snapshots style matcher. Used to store parsed stylesheets and prevent
 * unecessary re-parsing of modules between different tests.
 */
class CSSModuleSnapshotsContext {
  public static instance = new CSSModuleSnapshotsContext();

  // Map of stylesheet hashes to parsed ASTs.
  private styleSheets: Map<string, CssStylesheetAST>;

  private constructor() {
    this.styleSheets = new Map();
  }

  /**
   * Adds a stylesheet to the context, and parses to an AST.
   * 
   * If the stylesheet is already present, it will be skipped.
   *
   * @param nameHash The hash of the CSS module name.
   * @param styleSheet The stylesheet content.
   */
  addStyleSheet(nameHash: string, styleSheet: string) {
    if (this.styleSheets.has(nameHash)) {
      return;
    }

    const compiledSheet = css.parse(styleSheet);
    this.styleSheets.set(nameHash, compiledSheet);
  }

  /**
   * Adds stylesheets found in the document to the context.
   */
  addStylesheetsToContext() {
    const cssModuleStyleElements = Array.from(document.querySelectorAll('style[data-css-module]'));

    cssModuleStyleElements.forEach((styleElement) => {
      // Get hash of the CSS module name from the data attribute
      const hashedName = styleElement.getAttribute('data-css-module')!;

      // Add the stylesheet to the context (skip it if it already exists)
      this.addStyleSheet(hashedName, styleElement.innerHTML);
    });
  }

  /**
   * Gets all style rules from the stylesheets in the context.
   */
  get styleRules(): CssRuleAST[] {
    const definitions: CssRuleAST[] = [];

    this.styleSheets.forEach((styleSheet) => {
      const rules = Array.from(styleSheet.stylesheet.rules.values()).filter((rule): rule is CssRuleAST => rule.type === 'rule');
      definitions.push(...rules);
    });

    return definitions;
  }
};

export { CSSModuleSnapshotsContext };