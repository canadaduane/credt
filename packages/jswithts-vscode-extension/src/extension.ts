import { ExtensionContext, workspace } from "vscode";
import { TsPlugin } from "./tsplugin";

export function activate(context: ExtensionContext) {
  console.info("Activate jswithts-vscode extension");
  const tsPlugin = new TsPlugin(context);

  if (workspace.textDocuments.some((doc) => doc.languageId === "javascript")) {
    tsPlugin.askToEnable();
  } else {
    const onTextDocumentListener = workspace.onDidOpenTextDocument((doc) => {
      if (doc.languageId === "javascript") {
        tsPlugin.askToEnable();
        onTextDocumentListener.dispose();
      }
    });

    context.subscriptions.push(onTextDocumentListener);
  }
}

export function deactivate() {
  console.info("Deactivate jswithts-vscode extension");
  return stop;
}

// function addDidChangeTextDocumentListener(getLS: () => LanguageClient) {
//     workspace.onDidChangeTextDocument((evt) => {
//         if (evt.document.languageId === 'typescript' || evt.document.languageId === 'javascript') {
//             getLS().sendNotification('$/onDidChangeTsOrJsFile', {
//                 uri: evt.document.uri.toString(true),
//                 changes: evt.contentChanges.map((c) => ({
//                     range: {
//                         start: { line: c.range.start.line, character: c.range.start.character },
//                         end: { line: c.range.end.line, character: c.range.end.character }
//                     },
//                     text: c.text
//                 }))
//             });
//         }
//     });
// }
