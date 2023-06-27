export async function registerPrintOnExit(document) {
  process.on("beforeExit", async (code) => {
    if (code === 0) {
      printTidyDom(document);
    }
  });
}

async function printTidyDom(document) {
  process.stdout.write(document.toString());
}
