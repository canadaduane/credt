import {
  commands,
  ExtensionContext,
  extensions,
  window,
  workspace,
} from "vscode";

export class TsPlugin {
  private enabled: boolean;

  constructor(context: ExtensionContext) {
    this.enabled = TsPlugin.isEnabled();
    this.toggleTsPlugin(this.enabled);

    context.subscriptions.push(
      workspace.onDidChangeConfiguration(() => {
        const enabled = TsPlugin.isEnabled();
        if (enabled !== this.enabled) {
          this.enabled = enabled;
          this.toggleTsPlugin(this.enabled);
        }
      })
    );
  }

  static isEnabled(): boolean {
    return (
      workspace.getConfiguration("jswithts").get<boolean>("enable-ts-plugin") ??
      false
    );
  }

  private async toggleTsPlugin(enable: boolean) {
    const extension = extensions.getExtension(
      "vscode.typescript-language-features"
    );

    if (!extension) {
      return;
    }

    // This somewhat semi-public command configures our TypeScript plugin.
    // The plugin itself is always present, but enabled/disabled depending on this config.
    // It is done this way because it allows us to toggle the plugin without restarting VS Code
    // and without having to do hacks like updating the extension's package.json.
    commands.executeCommand(
      "_typescript.configurePlugin",
      "jswithts-typescript-plugin",
      {
        enable,
      }
    );
  }

  async askToEnable() {
    const shouldAsk = workspace
      .getConfiguration("jswithts")
      .get<boolean>("ask-to-enable-ts-plugin");
    if (this.enabled || !shouldAsk) {
      return;
    }

    const answers = [
      "Ask again later",
      "Don't show this message again",
      "Enable Plugin",
    ];
    const response = await window.showInformationMessage(
      "The jswithts for VS Code extension now contains a TypeScript plugin. " +
        "Enabling it will provide intellisense for JS files that contain typescript as comments. " +
        "Would you like to enable it? " +
        "You can always enable/disable it later on through the extension settings.",
      ...answers
    );

    if (response === answers[2]) {
      workspace.getConfiguration("jswithts").update("enable-ts-plugin", true, true);
    } else if (response === answers[1]) {
      workspace
        .getConfiguration("jswithts")
        .update("ask-to-enable-ts-plugin", false, true);
    }
  }
}
