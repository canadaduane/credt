import { html } from "sinuous";
import { dhtml } from "sinuous/hydrate";
import { observable } from "sinuous/observable";
export { JSDOM } from "jsdom";

export type HtmlFn = typeof html;
export type DhtmlFn = typeof dhtml;
export type AttachFn = (dom: Node) => void;
export type HtmlOrDhtmlFn = HtmlFn | DhtmlFn;

export type HeadFn = ({
  builtins,
  html,
  o,
}: {
  builtins: ReturnType<typeof html> | ReturnType<typeof dhtml>;
  html: HtmlOrDhtmlFn;
  o: typeof observable;
}) => Node;

export type BodyFn = ({
  html,
  o,
}: {
  html: HtmlOrDhtmlFn;
  o: typeof observable;
}) => Node;

export as namespace credit;
