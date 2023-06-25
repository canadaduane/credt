import url from "node:url";
import path from "node:path";
import { html as chtml } from "sinuous";

import { readFile } from "./readFile.js";
import { registerPrintOnExit } from "./printDom.js";

/**
 * @param {credit.MountPayload} options
 */
export async function mount({ rootImports, head, body }) {
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
    // @ts-expect-error
    globalThis.document.head.append(node);
  }

  if (body && process.env.NODE_ENV !== "development") {
    const node = body({}) ?? chtml``;
    // @ts-expect-error
    globalThis.document.body.append(node);
  }
}

/**
 * Returns the relative path of the **javascript module that called Credit**
 * suitable to be inserted as a script into the dom.
 *
 * @param {string} module The top-level JS file:// import.meta.url
 * @returns {string}
 */
function scriptModuleSrc(module) {
  return path.basename(module);
}

/**
 * One-time setup of server-side DOM object.
 *
 * @returns {Promise<credit.JSDOM>}
 */
async function createServerSideDom() {
  if (globalThis.document) throw Error("dom already exists");

  // Create a virtual server-side DOM
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM();

  // Prepare globals necessary for server-side rendering via jsdom
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;

  return dom;
}