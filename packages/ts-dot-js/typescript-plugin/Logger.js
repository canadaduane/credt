class Logger {
  constructor(tsLogService, suppressNonTsDotJsLogs = false, logDebug = false) {
    this.tsLogService = tsLogService;
    this.suppressNonTsDotJsLogs = suppressNonTsDotJsLogs;
    this.logDebug = logDebug;

    if (suppressNonTsDotJsLogs) {
      const log = this.tsLogService.info.bind(this.tsLogService);
      this.tsLogService.info = (s) => {
        if (s.startsWith("-TsDotJs Plugin-")) {
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
    this.tsLogService.info("-TsDotJs Plugin- " + str);
  }

  debug(...args) {
    if (!this.logDebug) {
      return;
    }
    this.log(...args);
  }
}

module.exports.Logger = Logger;
