const vscode = require("vscode");

class TsPlugin {
  constructor(context /*: ExtensionContext*/) {
    this.enabled = TsPlugin.isEnabled();
    this.toggleTsPlugin(this.enabled);

    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(() => {
        const enabled = TsPlugin.isEnabled();
        if (enabled !== this.enabled) {
          this.enabled = enabled;
          this.toggleTsPlugin(this.enabled);
        }
      })
    );
  }

  static isEnabled() {
    return (
      vscode.workspace.getConfiguration("js-with-ts").get("enable-ts-plugin") ??
      false
    );
  }

  async toggleTsPlugin(enable) {
    const extension = vscode.extensions.getExtension(
      "vscode.typescript-language-features"
    );

    if (!extension) {
      return;
    }

    // This somewhat semi-public command configures our TypeScript plugin.
    // The plugin itself is always present, but enabled/disabled depending on this config.
    // It is done this way because it allows us to toggle the plugin without restarting VS Code
    // and without having to do hacks like updating the extension's package.json.
    vscode.commands.executeCommand(
      "_typescript.configurePlugin",
      "jswithts-typescript-plugin",
      {
        enable,
      }
    );
  }

  async askToEnable() {
    const shouldAsk = vscode.workspace
      .getConfiguration("jswithts")
      .get("ask-to-enable-ts-plugin");
    if (this.enabled || !shouldAsk) {
      return;
    }

    const answers = [
      "Ask again later",
      "Don't show this message again",
      "Enable Plugin",
    ];
    const response = await vscode.window.showInformationMessage(
      "The jswithts for VS Code extension now contains a TypeScript plugin. " +
        "Enabling it will provide intellisense for JS files that contain typescript as comments. " +
        "Would you like to enable it? " +
        "You can always enable/disable it later on through the extension settings.",
      ...answers
    );

    if (response === answers[2]) {
      vscode.workspace
        .getConfiguration("jswithts")
        .update("enable-ts-plugin", true, true);
    } else if (response === answers[1]) {
      vscode.workspace
        .getConfiguration("jswithts")
        .update("ask-to-enable-ts-plugin", false, true);
    }
  }
}

module.exports = TsPlugin;
