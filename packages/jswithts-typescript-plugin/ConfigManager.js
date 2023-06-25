const { EventEmitter } = require("events");

const configurationEventName = "configuration-changed";

class ConfigManager {
  emitter = new EventEmitter();
  config = { enable: true };

  onConfigurationChanged(listener) {
    this.emitter.on(configurationEventName, listener);
  }

  updateConfigFromPluginConfig(config) {
    this.config = {
      ...this.config,
      ...config,
    };
    this.emitter.emit(configurationEventName, config);
  }

  getConfig() {
    return this.config;
  }
}

module.exports.ConfigManager = ConfigManager;
