import { html, svg, h, hs } from "sinuous";
import { dhtml, hydrate } from "sinuous/hydrate";
import { observable, subscribe } from "sinuous/observable";

export const isServer = typeof global === "object";

/**
 * @param {string} caller The import.meta.url of the caller
 * @param {{head?: credit.HeadFn, body?: credit.BodyFn}} options
 */
export default async function credit(caller, { head, body } = {}) {
  const isHtml = caller.endsWith(".html.js");

  // SSR needs a DOM
  if (!globalThis.document) {
    const dom = await createServerSideDom();
    await registerPrintOnExit(dom);
  }

  if (isServer) {
    let builtins;

    if (isHtml) {
      const { readFile } = await import("./readFile.js");

      builtins = html`
        <script type="importmap">
          ${await readFile("importmap.json")}
        </script>
        <script type="module" src="./${await getCallerPath(caller)}"></script>
      `;
    } else {
      builtins = html``;
    }

    if (head) {
      const node = head({ builtins, html, observable }) ?? builtins;
      globalThis.document.head.append(node);
    }

    if (body) {
      const node = body({ html, observable }) ?? html``;
      globalThis.document.body.append(node);
    }
  } else {
    // This is the client

    const headEl = globalThis.document.head.firstElementChild;

    if (headEl) {
      // This is the client, and the HTML head is present, so we hydrate
      const { dhtml: html, hydrate } = await import("sinuous/hydrate");

      if (head) {
        const builtins = html``;
        const node = head({ builtins, html, observable }) ?? builtins;
        hydrate(node, headEl);
      }
    } else {
      // This is the client, but the HTML head is missing--not good!
      const { html } = await import("sinuous");

      if (head) {
        const builtins = html``;
        const node = head({ builtins, html, observable }) ?? builtins;
        globalThis.document.head.append(node);
      }
    }

    const bodyEl = globalThis.document.body.firstElementChild;

    if (bodyEl) {
      // This is the client, and the HTML body is present, so we hydrate
      const { dhtml: html, hydrate } = await import("sinuous/hydrate");

      if (body) {
        const node = body({ html, observable }) ?? html``;
        hydrate(node, bodyEl);
      }
    } else {
      // This is the client, but the HTML body is missing (probably development mode)
      const { html } = await import("sinuous");

      if (body) {
        const builtins = html``;
        const node = body({ html, o }) ?? builtins;
        globalThis.document.body.append(node);
      }
    }
  }

  /**
   *
   * @param {TemplateStringsArray} strings
   * @param  {...any[]} values
   * @returns {credit.VNode<{}> | credit.VNode<{}>[]}
   */
  const htmlFn =
    isServer || !globalThis.document.body.firstElementChild
      ? html
      : (await import("sinuous/hydrate")).dhtml;

  return { html: htmlFn };
}

/**
 *
 * @param {credit.JSDOM} dom
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
 * @param {credit.JSDOM} dom
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
 * @returns {Promise<string>}
 */
async function getCallerPath(caller) {
  const url = await import("node:url");
  const path = await import("node:path");

  const filePath = url.fileURLToPath(caller);
  const currDir = path.dirname(url.fileURLToPath(import.meta.url));
  return path.relative(currDir, filePath);
}
