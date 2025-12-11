import css, { CssRuleAST, CssStylesheetAST } from '@adobe/css-tools';

export type StylesheetRule = {
  selectors: string;
  declarations: Record<string, string>;
}

export class Stylesheet {
  private ast: CssStylesheetAST | null = null;

  public rules: Record<string, StylesheetRule> = {};

  constructor(public nameHash: string, public content: string) {
    this.parseStylesheet(content);
    this.extractRules(); 
  }

  public get rulesArray(): StylesheetRule[] {
    return Object.values(this.rules);
  }

  private parseStylesheet(content: string) {
    this.ast = css.parse(content);
  }

  private extractRules() {
    this.rules = this.ast!.stylesheet.rules.reduce<Record<string, StylesheetRule>>((acc, rule) => {
      if (rule.type === 'rule') {
        const cssRule = rule as CssRuleAST;
        const selectors = cssRule.selectors.join(', ');

        const declarations: Record<string, string> = rule.declarations.reduce((declAcc, decl) => {
          if (decl.type === 'declaration') {
            declAcc[decl.property] = decl.value;
          }
          return declAcc;
        }, {} as Record<string, string>);

        return {
          ...acc,
          [selectors]: {
            selectors,
            declarations,
          }
        };
      }

      return acc;
    }, {});
  }
}