import * as Types from "./types.ts";
import { html as chtml, svg, h, hs } from "sinuous";
import { dhtml, hydrate } from "sinuous/hydrate";

export { observable, subscribe } from "sinuous/observable";

export const isServer = typeof global === "object";
const headEl = globalThis.document?.head.firstElementChild;
const bodyEl = globalThis.document?.body.firstElementChild;

/**
 * @param {types.MountPayload} options
 */
export async function mount({ rootImports, head, body }) {
  if (isServer) {
    (await import("./ssr/credit-ssr.js")).mount({ rootImports, head, body });
  } else {
    // This is the client

    if (headEl) {
      // This is the client, and the HTML head is present, so we hydrate
      if (head) {
        const builtins = dhtml``;
        const node = head({ builtins }) ?? builtins;
        // @ts-expect-error
        hydrate(node, headEl);
      }
    } else {
      // This is the client, but the HTML head is missing--not good!
      console.warn("html head content missing");
    }

    if (bodyEl) {
      // This is the client, and the HTML body is present, so we hydrate
      if (body) {
        const node = body({}) ?? dhtml``;
        // @ts-expect-error
        hydrate(node, bodyEl);
      }
    } else {
      // This is the client, but the HTML body is missing (probably development mode)
      if (body) {
        const builtins = chtml``;
        const node = body({}) ?? builtins;
        // @ts-expect-error
        globalThis.document.body.append(node);
      }
    }
  }
}

/**
 *
 * @param {TemplateStringsArray} strings
 * @param  {...any[]} values
 * @returns {credit.NodeType}
 */
export const html = isServer || !bodyEl ? chtml : dhtml;
