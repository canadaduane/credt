import { h, hs, svg } from "sinuous";
import { o, observable, subscribe } from "sinuous/observable";

export const isServer = typeof global === "object";

/**
 * @param {string} caller The import.meta.url of the caller
 * @param {{head?: credit.HeadFn, body?: credit.BodyFn}} options
 */
export default async function credit(caller, { head, body } = {}) {
  // /** @type {credit.AttachFn} */ let headFn;
  // /** @type {credit.AttachFn} */ let bodyFn;
  /** @type {credit.HtmlOrDhtmlFn} */ let htmlOrDhtmlFn;

  const isHtml = caller.endsWith(".html.js");

  if (isServer) {
    const { html } = await import("sinuous");
    htmlOrDhtmlFn = html;

    let builtins;

    if (isHtml) {
      const dom = await createServerSideDom();

      const { readFile } = await import("./readFile.js");
      const importMap = await readFile("importmap.json");

      await registerPrintOnExit(dom);

      builtins = html`
        <script type="importmap">
          ${importMap.trimEnd()}
        </script>
        ${await getCallerModule(caller, html)}
      `;
    } else {
      builtins = html``;
    }

    if (head) {
      const node = head({ builtins, html, o }) ?? builtins;
      globalThis.document.head.append(node);
    }

    if (body) {
      const node = body({ html, o }) ?? html``;
      globalThis.document.body.append(node);
    }
  } else {
    // This is the client

    const headEl = globalThis.document.head.firstElementChild;

    if (headEl) {
      // This is the client, and the HTML head is present, so we hydrate
      const { dhtml: html, hydrate } = await import("sinuous/hydrate");
      htmlOrDhtmlFn = html;

      if (head) {
        const builtins = html``;
        const node = head({ builtins, html, o }) ?? builtins;
        hydrate(node, headEl);
      }
    } else {
      // This is the client, but the HTML head is missing--not good!
      const { html } = await import("sinuous");
      htmlOrDhtmlFn = html;

      if (head) {
        const builtins = html``;
        const node = head({ builtins, html, o }) ?? builtins;
        globalThis.document.head.append(node);
      }
    }

    const bodyEl = globalThis.document.body.firstElementChild;

    if (bodyEl) {
      // This is the client, and the HTML body is present, so we hydrate
      const { dhtml: html, hydrate } = await import("sinuous/hydrate");
      htmlOrDhtmlFn = html;

      if (body) {
        const node = body({ html, o }) ?? html``;
        hydrate(node, bodyEl);
      }
    } else {
      // This is the client, but the HTML body is missing (probably development mode)
      const { html } = await import("sinuous");
      htmlOrDhtmlFn = html;

      if (body) {
        const builtins = html``;
        const node = body({ html, o }) ?? builtins;
        globalThis.document.body.append(node);
      }
    }
  }

  return { html: htmlOrDhtmlFn };
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

/**
 * Inserts the **javascript module that called Credit** into the dom.
 *
 * @param {string} caller
 * @param {credit.HtmlFn} html
 */
async function getCallerModule(caller, html) {
  const url = await import("node:url");
  const path = await import("node:path");

  const filePath = url.fileURLToPath(caller);
  const currDir = path.dirname(url.fileURLToPath(import.meta.url));
  const relPath = path.relative(currDir, filePath);

  return html`<script type="module" src="./${relPath}"></script>`;
}
