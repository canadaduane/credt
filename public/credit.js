import { h, hs, svg } from "sinuous";
import { o, observable, subscribe } from "sinuous/observable";

export const isServer = typeof global === "object";

/**
 * @typedef {import("jsdom").JSDOM} JSDOM
 * @typedef {typeof import('sinuous').html} HtmlFn
 * @typedef {typeof import('sinuous/hydrate').dhtml} DhtmlFn
 * @typedef {(selector: string, dom: Node) => void} AttachFn
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
      const dom = await createServerSideDom();

      await insertCallerModule(dom, caller, html);

      options.ssr?.({ document: dom.window.document, html });

      await registerPrintOnExit(dom);
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
        // @ts-ignore
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

/**
 *
 * @param {JSDOM} dom
 * @param {public.UnifiedModules} modules
 */
async function printTidyDom(dom, modules) {
  const output = await modules
    .unified()
    .use(modules.parse, { emitParseErrors: true, verbose: true })
    .use(modules.format)
    .use(modules.stringify)
    .process(dom.serialize());

  console.log(String(output));
}

/**
 *
 * @param {JSDOM} dom
 */
async function registerPrintOnExit(dom) {
  const { unified } = await import("unified");
  const { default: parse } = await import("rehype-parse");
  const { default: format } = await import("rehype-format");
  const { default: stringify } = await import("rehype-stringify");

  process.on("beforeExit", async (code) => {
    if (code === 0) {
      printTidyDom(dom, { unified, parse, format, stringify });
    }
  });
}

async function createServerSideDom() {
  if (globalThis.document) throw Error("dom already exists");

  const { JSDOM } = await import("jsdom");
  const { default: multiline } = await import("multiline-ts");
  const { readFile } = await import("./readFile.js");
  const importMap = await readFile("importmap.json");

  // Create a virtual server-side DOM
  const dom = new JSDOM(multiline`
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

  // Prepare globals necessary for server-side rendering via jsdom
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;

  return dom;
}

/**
 * Inserts the **javascript module that called Credit** into the dom.
 *
 * @param {JSDOM} dom
 * @param {string} caller
 * @param {HtmlFn} html
 */
async function insertCallerModule(dom, caller, html) {
  const url = await import("node:url");
  const path = await import("node:path");

  const filePath = url.fileURLToPath(caller);
  const currDir = path.dirname(url.fileURLToPath(import.meta.url));
  const relPath = path.relative(currDir, filePath);

  dom.window.document.head.append(
    html`<script type="module" src="./${relPath}"></script>`
  );
}
