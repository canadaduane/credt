class Logger {
  constructor(tsLogService, suppressNonjswithtsLogs = false, logDebug = false) {
    this.tsLogService = tsLogService;
    this.suppressNonjswithtsLogs = suppressNonjswithtsLogs;
    this.logDebug = logDebug;

    if (suppressNonjswithtsLogs) {
      const log = this.tsLogService.info.bind(this.tsLogService);
      this.tsLogService.info = (s) => {
        if (s.startsWith("-jswithts Plugin-")) {
          log(s);
        }
      };
    }
  }

  log(...args) {
    const str = args
      .map((arg) => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return "[object that cannot by stringified]";
          }
        }
        return arg;
      })
      .join(" ");
    this.tsLogService.info("-jswithts Plugin- " + str);
  }

  debug(...args) {
    if (!this.logDebug) {
      return;
    }
    this.log(...args);
  }
}

module.exports.Logger = Logger;
