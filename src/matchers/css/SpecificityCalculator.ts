type Specificity = {
  inline: number;
  idSelectors: number;
  classSelectors: number;
  typeSelectors: number;
}

const isTypeSelector = (part: string): boolean => {
  const pseudoElement = /(::[a-zA-Z]+[a-zA-Z0-9-]*)*/;
  const elementSelector = /^[a-zA-Z]+[a-zA-Z0-9-]*$/;
  return elementSelector.test(part) || pseudoElement.test(part);
}

const isClassSelector = (part: string): boolean => {
  const classSelector = /^\.[a-zA-Z]+[a-zA-Z0-9-]*$/;
  const attributeSelector = /^\[.+\]$/;
  const pseudoClassSelector = /^:[^:].*$/;
  return false;
}

export class SpecificityCalculator {
  constructor(public selector: string) {}

  calculate() {
    console.log(this.selector);

    const parts = this.selector.split(/\s+/);
    console.log(parts);

    const specificity = parts.reduce<Specificity>((specificity, part) => {
      if (part.startsWith('.')) {
        specificity.classSelectors += 1;
      }

      if (part.startsWith('#')) {
        specificity.idSelectors += 1;
      }

      if (isTypeSelector(part)) {
        specificity.typeSelectors += 1;
      }

      return specificity;
    }, { inline: 0, idSelectors: 0, classSelectors: 0, typeSelectors: 0 });

    console.log(specificity);
  }
}