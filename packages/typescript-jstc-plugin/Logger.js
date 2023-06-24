class Logger {
  constructor(tsLogService, suppressNonJstcLogs = false, logDebug = false) {
    this.tsLogService = tsLogService;
    this.suppressNonJstcLogs = suppressNonJstcLogs;
    this.logDebug = logDebug;

    if (suppressNonJstcLogs) {
      const log = this.tsLogService.info.bind(this.tsLogService);
      this.tsLogService.info = (s) => {
        if (s.startsWith("-Jstc Plugin-")) {
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
    this.tsLogService.info("-Jstc Plugin- " + str);
  }

  debug(...args) {
    if (!this.logDebug) {
      return;
    }
    this.log(...args);
  }
}

module.exports.Logger = Logger;
