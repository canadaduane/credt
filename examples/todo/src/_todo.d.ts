import type { unified } from "unified";
import type parse from "rehype-parse";
import type format from "rehype-format";
import type stringify from "rehype-stringify";

export { Observable } from "sinuous/observable";

export type Item = { id: number; text: string };

export type UnifiedModules = {
  unified: typeof unified;
  parse: typeof parse;
  format: typeof format;
  stringify: typeof stringify;
};

export as namespace todo;
