import { html as chtml } from "sinuous";
import { dhtml } from "sinuous/hydrate";
import { observable as observe } from "sinuous/observable";
export { JSDOM } from "jsdom";
export { VNode } from "sinuous/hydrate";

export type NodeType = ReturnType<typeof chtml> | ReturnType<typeof dhtml>;
export type HtmlFn = typeof chtml;
export type DhtmlFn = typeof dhtml;
export type HtmlOrDhtmlFn = HtmlFn | DhtmlFn;

export type HeadFn = ({
  builtins,
  html,
  observable,
}: {
  builtins: NodeType;
  html: HtmlOrDhtmlFn;
  observable: typeof observe;
}) => NodeType;

export type BodyFn = ({
  html,
  observable,
}: {
  html: HtmlOrDhtmlFn;
  observable: typeof observe;
}) => NodeType;

export as namespace credit;
