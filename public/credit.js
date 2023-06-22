import { h, hs, svg } from "sinuous";
import { o, observable, subscribe } from "sinuous/observable";

export const isServer = typeof global === "object";

/**
 * @typedef {import("jsdom").JSDOM} JSDOM
 * @typedef {typeof import('sinuous').html} HtmlFn
 * @typedef {typeof import('sinuous/hydrate').dhtml} DhtmlFn
 * @typedef {(dom: Node) => void} AttachFn
 * @typedef {HtmlFn | DhtmlFn} HtmlOrDhtmlFn
 */

/**
 * @param {string} caller The import.meta.url of the caller
 * @param {{ssr?: ({document, html}: {document: Document, html: HtmlFn}) => void}} options Options
 */
export default async function credit(caller, options = {}) {
  /** @type {AttachFn} */ let headFn;
  /** @type {AttachFn} */ let bodyFn;
  /** @type {HtmlOrDhtmlFn} */ let htmlOrDhtmlFn;

  const isHtml = caller.endsWith(".html.js");

  if (isServer) {
    const { html } = await import("sinuous");

    if (isHtml) {
      const dom = await createServerSideDom();

      const { readFile } = await import("./readFile.js");
      const importMap = await readFile("importmap.json");

      await insertCallerModule(dom, caller, html);

      options.ssr?.({ document: dom.window.document, html });

      await registerPrintOnExit(dom);

      headFn = (fn) =>
        globalThis.document.head.append(
          fn(html`
            <script type="importmap">
              ${importMap.trimEnd()}
            </script>
          `)
        );
    } else {
      headFn = (fn) => globalThis.document.head.append(fn(html``));
    }

    htmlOrDhtmlFn = html;

    bodyFn = (node) => globalThis.document.body.append(node);
  } else if (globalThis.document.body.childElementCount > 0) {
    // This is the client, and the HTML body is present, so we hydrate

    const { dhtml, hydrate } = await import("sinuous/hydrate");

    htmlOrDhtmlFn = dhtml;

    headFn = (fn) => globalThis.document.head.append(fn(html``));
    bodyFn = (node) => {
      const firstChild = globalThis.document.body.firstElementChild;
      if (firstChild) {
        // @ts-ignore
        hydrate(node, firstChild);
      } else {
        throw Error(`unable to hydrate: html body missing first child`);
      }
    };
  } else {
    // This is the client, but the HTML body is missing all data, so we
    // build the nodes rather than hydrate
    const { html } = await import("sinuous");

    htmlOrDhtmlFn = html;

    headFn = (fn) => globalThis.document.head.append(fn(html``));
    bodyFn = (node) => globalThis.document.body.append(node);
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
    head: headFn,
    body: bodyFn,
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

/**
 * One-time setup of server-side DOM object.
 *
 * @returns {Promise<JSDOM>}
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
