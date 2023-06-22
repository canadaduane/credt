import url from "node:url";
import path from "node:path";
import { html as chtml } from "sinuous";

import { readFile } from "./readFile.js";
import { registerPrintOnExit } from "./printDom.js";

/**
 * @param {{modules: string[], head?: credit.HeadFn, body?: credit.BodyFn}} options
 */
export async function mount({ modules, head, body }) {
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
      ${modules.map(
        (m) =>
          chtml`<script
            type="module"
            src="./${scriptModuleSrc(m, url, path)}"
          ></script> `
      )}
    `;

  if (head) {
    const node = head({ builtins }) ?? builtins;
    globalThis.document.head.append(node);
  }

  if (body) {
    const node = body({}) ?? chtml``;
    globalThis.document.body.append(node);
  }
}

/**
 * Returns the relative path of the **javascript module that called Credit**
 * suitable to be inserted as a script into the dom.
 *
 * @param {string} module The top-level JS file:// import.meta.url
 * @param {any} url The node:url module
 * @param {any} path The node:path module
 * @returns {Promise<string>}
 */
function scriptModuleSrc(module, url, path) {
  const filePath = url.fileURLToPath(module);
  const currDir = path.dirname(url.fileURLToPath(import.meta.url));
  return path.relative(currDir, filePath);
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
