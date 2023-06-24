import { unified } from "unified";
import parse from "rehype-parse";
import format from "rehype-format";
import stringify from "rehype-stringify";

/**
 *
 * @param {credit.JSDOM} dom
 */
export async function registerPrintOnExit(dom) {
  process.on("beforeExit", async (code) => {
    if (code === 0) {
      printTidyDom(dom);
    }
  });
}

/**
 *
 * @param {credit.JSDOM} dom
 */
async function printTidyDom(dom) {
  const output = await unified()
    .use(parse, { emitParseErrors: true, verbose: true })
    .use(format)
    .use(stringify)
    .process(dom.serialize());

  console.log(String(output));
}
