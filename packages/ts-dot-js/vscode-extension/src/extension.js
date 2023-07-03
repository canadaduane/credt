const vscode = require("vscode");
const TsPlugin = require("./tsplugin");
const fs = require("fs");
const path = require("path");

let askedToEnable = false;
const askToEnable = (tsPlugin) => {
  tsPlugin.askToEnable();
  askedToEnable = true;
};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.info("Activate ts-dot-js vscode extension");
  const tsPlugin = new TsPlugin(context);
  const documents = vscode.workspace.textDocuments;

  if (documents.some((doc) => doc.languageId === "javascript")) {
    askToEnable(tsPlugin);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (doc.languageId === "javascript") {
        askToEnable(tsPlugin);
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor) {
          handleActiveEditor(editor);
        }
      },
      null,
      context.subscriptions
    )
  );

  // If an editor is already open, start by handling it
  if (vscode.window.activeTextEditor) {
    handleActiveEditor(vscode.window.activeTextEditor);
  }
}

// This method is called when your extension is deactivated
function deactivate() {
  console.info("Deactivate ts-dot-js vscode extension");
}

module.exports = {
  activate,
  deactivate,
};

function handleActiveEditor(editor) {
  const fileUri = editor.document.uri;
  if (fileUri.scheme === "file" && fileUri.path.endsWith(".js")) {
    const fileDir = path.dirname(fileUri.fsPath);
    vscode.workspace
      .findFiles("**/tsconfig.json", "**/node_modules/**")
      .then((tsconfigFiles) => {
        for (const tsconfigFile of tsconfigFiles) {
          const tsconfigDir = path.dirname(tsconfigFile.fsPath);
          // check if file path is either equal to or is an ancestor of current document
          if (fileDir.includes(tsconfigDir)) {
            const content = fs.readFileSync(tsconfigFile.fsPath);
            const tsconfig = JSON.parse(content.toString());
            if (
              tsconfig.compilerOptions &&
              tsconfig.compilerOptions.customConditions &&
              tsconfig.compilerOptions.customConditions.includes("ts-dot-js")
            ) {
              vscode.languages.setTextDocumentLanguage(
                editor.document,
                "typescript"
              );
            }
          }
        }
      });
  }
}
