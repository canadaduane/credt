const vscode = require("vscode");
const { TsPlugin } = require("./tsplugin");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.info("Activate js-with-ts vscode extension");
  const tsPlugin = new TsPlugin(context);

  if (
    vscode.workspace.textDocuments.some(
      (doc) => doc.languageId === "javascript"
    )
  ) {
    tsPlugin.askToEnable();
  } else {
    const onTextDocumentListener = vscode.workspace.onDidOpenTextDocument(
      (doc) => {
        if (doc.languageId === "javascript") {
          tsPlugin.askToEnable();
          onTextDocumentListener.dispose();
        }
      }
    );

    context.subscriptions.push(onTextDocumentListener);
  }
}

// This method is called when your extension is deactivated
function deactivate() {
  console.info("Deactivate js-with-ts vscode extension");
  return stop;
}

module.exports = {
  activate,
  deactivate,
};
