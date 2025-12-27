import { Token } from "./tokenize";

interface Node {
  type: string;
};

export interface SelectorNode extends Node {
  type: 'Selector';
  value: string;
}

export interface StringNode extends Node {
  type: 'String';
  value: string;
}

export interface Expression extends Node {
  type: 'Expression',
  attribute: SelectorNode;
  operator?: string;
  value?: SelectorNode | StringNode;
}

export interface AttributeSelectorNode extends Node {
  type: 'AttributeSelector';
  expression: Expression;
}

export interface CompoundSelectorNode extends Node {
  type: 'CompoundSelector';
  selectors: SelectorNode[];
}

export interface CombinatorNode extends Node {
  type: 'Combinator',
  operator: Token;
  left: Node | null;
  right: Node | null;
}