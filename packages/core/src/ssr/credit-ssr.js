/*+ import type { JSDOM } from "jsdom"; */
/*+ import type { BuiltinMapper, MountPayload } from "../types.ts"; */
import path from "node:path";
import { html as chtml } from "sinuous";

import { readFile } from "./readFile.js";
import { registerPrintOnExit } from "./printDom.js";

export async function mount({ rootImports, head, body } /*: MountPayload*/) {
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

  // BuiltinMapper is an advanced function that probably won't be used often--it's an
  // escape hatch that allows the caller to modify the built-in <head /> tag contents.
  let map /*: BuiltinMapper*/ = (builtins) => builtins;
  let node = head?.({
    builtins: (m) => {
      if (!m)
        throw Error("`builtins(m)` must return a mapper that returns html");
      map = m;
    },
  });
  builtins = map(builtins);
  globalThis.document.head.append(chtml`${builtins}\n${node}`);

  if (body && process.env.NODE_ENV === "production") {
    const node = body({}) ?? chtml``;
    globalThis.document.body.append(node /*+ as Node*/);
  }
}

/**
 * Returns the relative path of the **javascript module that called Credit**
 * suitable to be inserted as a script into the dom.
 */
function scriptModuleSrc(module /*: string*/) {
  return path.basename(module);
}

// One-time setup of server-side DOM object.
async function createServerSideDom() /*: Promise<JSDOM>*/ {
  if (globalThis.document) throw Error("dom already exists");

  // Create a virtual server-side DOM
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM();

  // Prepare globals necessary for server-side rendering via jsdom
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;

  return dom;
}
