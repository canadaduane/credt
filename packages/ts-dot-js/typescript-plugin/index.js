// @ts-check
const { ScriptSnapshot } = require("typescript/lib/tsserverlibrary.js");
const { replaceMultilineComments } = require("./comments.js");
const { ConfigManager } = require("./ConfigManager.js");
const { Logger } = require("./Logger.js");

/* test */
module.exports = function ({
  /** @type {import('typescript/lib/tsserverlibrary')} */
  typescript,
}) {
  const configManager = new ConfigManager();

  return {
    //tssl.server.PluginCreateInfo
    create(
      /** @type {import('typescript/lib/tsserverlibrary').server.PluginCreateInfo} */
      info
    ) {
      const logger = new Logger(info.project.projectService.logger);

      configManager.updateConfigFromPluginConfig(info.config);
      if (configManager.getConfig().enable) {
        logger.log("Starting ts-dot-js plugin");
      } else {
        logger.log("ts-dot-js plugin disabled");
        logger.log(info.config);
      }

      /** @type {typeof info.languageServiceHost.getScriptSnapshot} */
      const getScriptSnapshot = info.languageServiceHost.getScriptSnapshot.bind(
        info.languageServiceHost
      );
      info.languageServiceHost.getScriptSnapshot = (fileName) => {
        const normalizedPath = typescript.server.toNormalizedPath(fileName);

        /** @type {import('typescript/lib/tsserverlibrary').server.ScriptInfo | undefined} */
        const scriptInfo =
          info.project.projectService.getOrCreateScriptInfoForNormalizedPath(
            normalizedPath,
            false
          );

        const snapshot = getScriptSnapshot(fileName);

        if (!scriptInfo || !snapshot) return snapshot;
        if (!fileName.endsWith(".ts.js")) return snapshot;

        // @ts-expect-error
        scriptInfo.scriptKind = typescript.ScriptKind.TS;

        if (
          configManager.getConfig().enable &&
          (fileName.startsWith("^") ||
            info.project.containsFile(normalizedPath)) &&
          snapshot
        ) {
          const input = snapshot.getText(0, snapshot.getLength());
          logger.log("snap in", fileName, input);
          const output = replaceMultilineComments(input, (s) => {
            if (s.startsWith("/*:")) {
              return "  " + s.slice(2, s.length - 2) + "  ";
            } else if (s.startsWith("/*+")) {
              return "   " + s.slice(3, s.length - 2) + "  ";
            } else {
              return s;
            }
          });
          logger.log("snap out", fileName, output);
          const newSnap = ScriptSnapshot.fromString(output);
          return newSnap;
        }

        return snapshot;
      };

      return info.languageService;
    },
  };
};
