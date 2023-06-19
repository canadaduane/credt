import { html } from "sinuous";

/** @type {import("jsdom").JSDOM} */
let dom;

// As soon as this file is imported, prepare SSR DOM on the server side
if (typeof global === "object") {
  const { JSDOM } = await import("jsdom");
  const { readFile } = await import("./readFile.js");
  const { default: multiline } = await import("multiline-ts");

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

  // Prepare globals necessary for server-side rendering via jsdom
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
}

/**
 *
 * @param {string} fileUrl
 */
export async function ssrRender(fileUrl) {
  // Don't render on client side
  if (typeof global !== "object") return;

  const url = await import("node:url");
  const path = await import("node:path");
  const { unified } = await import("unified");
  const { default: parse } = await import("rehype-parse");
  const { default: format } = await import("rehype-format");
  const { default: stringify } = await import("rehype-stringify");

  const filePath = url.fileURLToPath(fileUrl);
  const currDir = path.dirname(url.fileURLToPath(import.meta.url));
  const relPath = path.relative(currDir, filePath);

  dom.window.document.head.append(
    html`<script type="module" src="./${relPath}"></script>`
  );

  const output = await unified()
    .use(parse)
    .use(format)
    .use(stringify)
    .process(dom.serialize());
  console.log(String(output));
}
