export async function registerPrintOnExit(document /*: Document*/) {
  process.on("beforeExit", async (code) => {
    if (code === 0) {
      printTidyDom(document);
    }
  });
}

async function printTidyDom(document /*: Document*/) {
  process.stdout.write(document.toString());
}
