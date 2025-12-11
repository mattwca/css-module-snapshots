import { Stylesheet, StylesheetRule } from './Stylesheet';

/**
 * Singleton context for the CSS module snapshots style matcher. Used to store parsed stylesheets and prevent
 * unecessary re-parsing of modules between different tests.
 */
export class CSSModuleSnapshotsContext {
  public static instance = new CSSModuleSnapshotsContext();

  // Map of stylesheet hashes to parsed ASTs.
  private styleSheets: Map<string, Stylesheet>;

  private constructor() {
    this.styleSheets = new Map();
  }

  /**
   * Adds a given stylesheet, with name and content, to the context.
   * 
   * If the stylesheet is already present, it will be skipped.
   *
   * @param id The ID of the CSS module name.
   * @param stylesheetContent The stylesheet content.
   */
  addStyleSheet(id: string, stylesheetContent: string) {
    if (this.styleSheets.has(id)) {
      return;
    }

    const styleSheet = new Stylesheet(id, stylesheetContent);
    this.styleSheets.set(id, styleSheet);
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
  get styleRules(): StylesheetRule[] {
    return Array.from(this.styleSheets.values()).flatMap((stylesheet) => stylesheet.rulesArray);
  }
};