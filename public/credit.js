import { html } from "sinuous";
import { o } from "sinuous";
import { hydrate } from "sinuous/hydrate";

export const isServer = typeof global === "object";

/** @type {import("jsdom").JSDOM} */
let dom;

/**
 * @param {string} caller The import.meta.url of the caller
 */
export async function credit(caller) {
  if (isServer) {
    const url = await import("node:url");
    const path = await import("node:path");
    const { JSDOM } = await import("jsdom");
    const { default: multiline } = await import("multiline-ts");
    const { readFile } = await import("./readFile.js");

    const importMap = await readFile("importmap.json");

    // Create a virtual server-side DOM
    dom = new JSDOM(multiline`
      <!DOCTYPE html>
      <html>
        <head>
          <script type="importmap">
            ${importMap.trimEnd()}
          </script>
        </head>
        <body>
          <div class="todos" /> 
        </body> 
      </html>
    `);

    const filePath = url.fileURLToPath(caller);
    const currDir = path.dirname(url.fileURLToPath(import.meta.url));
    const relPath = path.relative(currDir, filePath);

    // Prepare globals necessary for server-side rendering via jsdom
    globalThis.document = dom.window.document;
    globalThis.Node = dom.window.Node;

    dom.window.document.head.append(
      html`<script type="module" src="./${relPath}"></script>`
    );

    const { unified } = await import("unified");
    const { default: parse } = await import("rehype-parse");
    const { default: format } = await import("rehype-format");
    const { default: stringify } = await import("rehype-stringify");

    process.on("beforeExit", async (code) => {
      const output = await unified()
        .use(parse)
        .use(format)
        .use(stringify)
        .process(dom.serialize());

      console.log(String(output));
    });
  }

  // /** @type {ReturnType<import("sinuous/hydrate").hydrate>} */
  // let hydrate;
  // if (!isServer) hydrate = await import("sinuous/hydrate");

  return {
    isServer,
    o,
    html: isServer
      ? (await import("sinuous")).html
      : (await import("sinuous/hydrate")).dhtml,
    attach: (selector, node) => {
      const mountPoint = globalThis.document.body.querySelector(selector);
      if (isServer) {
        mountPoint?.append(node);
      } else {
        hydrate(node, mountPoint.firstElementChild);
      }
    },
  };
}
