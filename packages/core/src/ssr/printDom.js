/*+ import type { JSDOM } from "jsdom"; */
import { unified } from "unified";
import parse from "rehype-parse";
import format from "rehype-format";
import stringify from "rehype-stringify";

export async function registerPrintOnExit(dom /*: JSDOM*/) {
  process.on("beforeExit", async (code) => {
    if (code === 0) {
      printTidyDom(dom);
    }
  });
}

async function printTidyDom(dom /*: JSDOM*/) {
  const output = await unified()
    .use(parse, { emitParseErrors: true, verbose: true })
    .use(format)
    .use(stringify)
    .process(dom.serialize());

  console.log(String(output));
}
