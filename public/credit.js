import { h, hs, svg } from "sinuous";
import { o, observable, subscribe } from "sinuous/observable";

export const isServer = typeof global === "object";

/**
 * @typedef {import("jsdom").JSDOM} JSDOM
 * @typedef {typeof import('sinuous').html} HtmlFn
 * @typedef {typeof import('sinuous/hydrate').dhtml} DhtmlFn
 * @typedef {(selector: string, dom: JSDOM) => void} AttachFn
 * @typedef {HtmlFn | DhtmlFn} HtmlOrDhtmlFn
 */

/**
 * @param {string} caller The import.meta.url of the caller
 * @param {{ssr?: ({document, html}: {document: Document, html: HtmlFn}) => void}} options Options
 */
export default async function credit(caller, options = {}) {
  /** @type {JSDOM} */ let dom;
  /** @type {AttachFn} */ let attachFn;
  /** @type {HtmlOrDhtmlFn} */ let htmlOrDhtmlFn;

  const isHtml = caller.endsWith(".html.js");

  if (isServer) {
    const { html } = await import("sinuous");

    if (isHtml) {
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
          <body />
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

      options.ssr?.({ document: dom.window.document, html });

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
    } else {
      console.warn("Credit: not an html file, skipping dom establishment")
    }

    htmlOrDhtmlFn = html;

    attachFn = (selector, node) => {
      const mountPoint = globalThis.document.body.querySelector(selector);
      mountPoint?.append(node);
    };
  } else if (globalThis.document.body.childElementCount > 0) {
    // This is the client, and the HTML body is present, so we hydrate

    const { dhtml, hydrate } = await import("sinuous/hydrate");

    htmlOrDhtmlFn = dhtml;

    attachFn = (selector, node) => {
      const mountPoint = globalThis.document.body.querySelector(selector);
      let firstChild = mountPoint?.firstElementChild;
      if (firstChild) {
        hydrate(node, firstChild);
      } else {
        throw Error(`hydration mountpoint missing first child: ${selector}`);
      }
    };
  } else {
    // This is the client, but the HTML body is missing all data, so we
    // build the nodes rather than hydrate
    const { html } = await import("sinuous");

    htmlOrDhtmlFn = html;

    attachFn = (_selector, node) => {
      const mountPoint = globalThis.document.body;
      mountPoint?.append(node);
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
    html: htmlOrDhtmlFn,
    attach: attachFn,
  };
}
