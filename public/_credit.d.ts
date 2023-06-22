import { html } from "sinuous";
import { dhtml } from "sinuous/hydrate";
import { observable as observe } from "sinuous/observable";
export { JSDOM } from "jsdom";
export { VNode } from "sinuous/hydrate";

export type HtmlFn = typeof html;
export type DhtmlFn = typeof dhtml;
export type AttachFn = (dom: Node) => void;
export type HtmlOrDhtmlFn = HtmlFn | DhtmlFn;

export type HeadFn = ({
  builtins,
  html,
  observable,
}: {
  builtins: ReturnType<typeof html> | ReturnType<typeof dhtml>;
  html: HtmlOrDhtmlFn;
  observable: typeof observe;
}) => Node;

export type BodyFn = ({
  html,
  observable,
}: {
  html: HtmlOrDhtmlFn;
  observable: typeof observe;
}) => Node;

export as namespace credit;
