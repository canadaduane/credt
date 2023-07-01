/*+ import type { VNode } from "sinuous/hydrate" */
/*+ import type { MountPayload } from "./types.ts" */
import { html as chtml } from "sinuous";
import { dhtml, hydrate } from "sinuous/hydrate";

export { h, hs, html as chtml, svg } from "sinuous";
export * from "sinuous/observable";
export * from "sinuous/hydrate";
export { t, template } from "sinuous/template";
export * from "sinuous-trace"
export * from "sinuous-lifecycle"

// @ts-ignore
globalThis.chtml = chtml;
// @ts-ignore
globalThis.dhtml = dhtml;
// @ts-ignore
globalThis.hydrate = hydrate;

export const isServer = typeof global === "object";
const headEl = globalThis.document?.head.firstElementChild;
const bodyEl = globalThis.document?.body.firstElementChild;

export async function mount({ rootImports, head, body } /*: MountPayload */) {
  if (isServer) {
    (await import("./ssr/index.js")).mount({ rootImports, head, body });
  } else {
    // This is the client

    if (headEl) {
      // This is the client, and the HTML head is present, so we hydrate
      if (head) {
        const builtins = dhtml``;
        const node = head({ builtins: (b) => b });
        // TODO(canadaduane): Do vnodes in the head actually work? Seems unlikely...
        hydrate((node ?? builtins) /*+ as VNode<{}>*/, headEl);
      }
    } else {
      // This is the client, but the HTML head is missing--not good!
      console.warn("html head content missing");
    }

    if (bodyEl) {
      // This is the client, and the HTML body is present, so we hydrate
      if (body) {
        const node = body({}) ?? dhtml``;
        hydrate(node /*+ as VNode<{}>*/, bodyEl);
      }
    } else {
      // This is the client, but the HTML body is missing (probably development mode)
      if (body) {
        const builtins = chtml``;
        const node = body({}) ?? builtins;
        globalThis.document.body.append(node /*+ as Node*/);
      }
    }
  }
}

export const html = isServer || !bodyEl ? chtml : dhtml;
