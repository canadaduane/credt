export { JSDOM } from "jsdom";
import { html as chtml } from "sinuous";
import { dhtml } from "sinuous/hydrate";
export { VNode } from "sinuous/hydrate";

type NodeType = ReturnType<typeof chtml> | ReturnType<typeof dhtml>;

type HeadFn = ({ builtins }: { builtins: NodeType }) => NodeType;

type BodyFn = ({}: {}) => NodeType;

export type MountPayload = {
  rootImports: string[];
  head?: HeadFn;
  body?: BodyFn;
};
