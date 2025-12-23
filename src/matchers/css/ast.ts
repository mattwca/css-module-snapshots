import { Token } from "./tokenizer";

interface Node {
  type: string;
};

export interface SelectorNode extends Node {
  type: 'Selector';
  value: string;
}

export interface SelectorListNode extends Node {
  type: 'SelectorList';
  selectors: SelectorNode[];
}

export interface CombinatorNode extends Node {
  type: 'Combinator',
  operator: Token;
  left: Node | null;
  right: Node | null;
}