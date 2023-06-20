import { h, hs, svg } from "sinuous";
import { o, observable, subscribe } from "sinuous/observable";

export const isServer = typeof global === "object";

/**
 * @typedef {(selector: string, dom: any) => void} AttachFn
 * @typedef {typeof import('sinuous').html | typeof import('sinuous/hydrate').dhtml} HtmlFn
 */

/** @type {import("jsdom").JSDOM} */
let dom;

/**
 * @param {string} caller The import.meta.url of the caller
 */
export async function credit(caller) {
  /** @type {AttachFn} */ let attachFn;
  /** @type {HtmlFn} */ let htmlFn;

  if (isServer) {
    const url = await import("node:url");
    const path = await import("node:path");
    const { html } = await import("sinuous");
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
      if (code !== 0) return;

      const output = await unified()
        .use(parse, { emitParseErrors: true, verbose: true })
        .use(format, { indent: "\t" })
        .use(stringify)
        .process(dom.serialize());

      console.log(String(output));
    });

    htmlFn = html;

    attachFn = (selector, node) => {
      const mountPoint = globalThis.document.body.querySelector(selector);
      mountPoint?.append(node);
    };
  } else {
    const { dhtml, hydrate } = await import("sinuous/hydrate");

    htmlFn = dhtml;

    attachFn = (selector, node) => {
      const mountPoint = globalThis.document.body.querySelector(selector);
      const firstChild = mountPoint?.firstElementChild;
      if (firstChild) {
        hydrate(node, firstChild);
      } else {
        throw Error(`hydration mountpoint missing first child: ${selector}`);
      }
    };
  }

  return {
    isServer,
    o,
    observable,
    h,
    hs,
    svg,
    subscribe,
    html: htmlFn,
    attach: attachFn,
  };
}
