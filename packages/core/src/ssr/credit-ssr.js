/*+ import type { JSDOM } from "jsdom"; */
import path from "node:path";
import { html as chtml } from "sinuous";

import { readFile } from "./readFile.js";
import { registerPrintOnExit } from "./printDom.js";
import { MountPayload } from "../types.ts";

export async function mount({ rootImports, head, body }/*: MountPayload*/) {
  // SSR needs a DOM
  if (!globalThis.document) {
    const dom = await createServerSideDom();
    await registerPrintOnExit(dom);
  }
  let builtins;

  builtins = chtml`
      <script type="importmap">
        ${await readFile("importmap.json")}
      </script>
      ${rootImports.map(
        (r) =>
          chtml`<script
            type="module"
            src="./${scriptModuleSrc(r)}"
          ></script> `
      )}
    `;

  if (head) {
    const node = head({ builtins }) ?? builtins;
    globalThis.document.head.append(node/*+ as Node*/);
  }

  if (body && process.env.NODE_ENV !== "development") {
    const node = body({}) ?? chtml``;
    globalThis.document.body.append(node/*+ as Node*/);
  }
}

/**
 * Returns the relative path of the **javascript module that called Credit**
 * suitable to be inserted as a script into the dom.
 */
function scriptModuleSrc(module/*: string*/) {
  return path.basename(module);
}

// One-time setup of server-side DOM object.
async function createServerSideDom()/*: Promise<JSDOM>*/ {
  if (globalThis.document) throw Error("dom already exists");

  // Create a virtual server-side DOM
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM();

  // Prepare globals necessary for server-side rendering via jsdom
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;

  return dom;
}
