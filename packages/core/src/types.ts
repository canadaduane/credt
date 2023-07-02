import { html as chtml } from "sinuous";
import { dhtml } from "sinuous/hydrate";
export { VNode } from "sinuous/hydrate";

type NodeType = ReturnType<typeof chtml> | ReturnType<typeof dhtml>;

export type BuiltinMapper = (original: NodeType) => NodeType;

type HeadFn = ({
  builtins,
}: {
  builtins: (map: BuiltinMapper) => void;
}) => Promise<NodeType>;

type BodyFn = ({}: {}) => Promise<NodeType>;

export type MountPayload = {
  rootImports: string[];
  head?: HeadFn;
  body?: BodyFn;
};
