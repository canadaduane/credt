/*+ import type { VNode } from "sinuous/hydrate" */
/*+ import type { MountPayload } from "./types.ts" */
import { html as chtml, svg, h, hs } from "sinuous";
import { dhtml, hydrate } from "sinuous/hydrate";

export { observable, subscribe } from "sinuous/observable";

export const isServer = typeof global === "object";
const headEl = globalThis.document?.head.firstElementChild;
const bodyEl = globalThis.document?.body.firstElementChild;


export async function mount({ rootImports, head, body }/*: MountPayload */) {
  if (isServer) {
    (await import("./ssr/credit-ssr.js")).mount({ rootImports, head, body });
  } else {
    // This is the client

    if (headEl) {
      // This is the client, and the HTML head is present, so we hydrate
      if (head) {
        const builtins = dhtml``;
        const node = head({ builtins }) ?? builtins;
        hydrate(node/*+ as VNode<{}>*/, headEl);
      }
    } else {
      // This is the client, but the HTML head is missing--not good!
      console.warn("html head content missing");
    }

    if (bodyEl) {
      // This is the client, and the HTML body is present, so we hydrate
      if (body) {
        const node = body({}) ?? dhtml``;
        hydrate(node/*+ as VNode<{}>*/, bodyEl);
      }
    } else {
      // This is the client, but the HTML body is missing (probably development mode)
      if (body) {
        const builtins = chtml``;
        const node = body({}) ?? builtins;
        globalThis.document.body.append(node/*+ as Node*/);
      }
    }
  }
}

export const html/*: typeof chtml | typeof dhtml*/ = isServer || !bodyEl ? chtml : dhtml;
