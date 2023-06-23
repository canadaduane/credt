import { html as chtml } from "sinuous";
import { dhtml } from "sinuous/hydrate";
export { JSDOM } from "jsdom";
export { VNode } from "sinuous/hydrate";

export type NodeType = ReturnType<typeof chtml> | ReturnType<typeof dhtml>;
export type HtmlFn = typeof chtml;
export type DhtmlFn = typeof dhtml;
export type HtmlOrDhtmlFn = HtmlFn | DhtmlFn;

export type HeadFn = ({ builtins }: { builtins: NodeType }) => NodeType;

export type BodyFn = ({}: {}) => NodeType;

export type MountPayload = {
  rootImports: string[];
  head?: credit.HeadFn;
  body?: credit.BodyFn;
};

export as namespace credit;
