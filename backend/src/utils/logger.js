const config = require('../config');

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = LOG_LEVELS[config.logLevel || 'info'] || LOG_LEVELS.info;

class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level: level.toUpperCase(),
      context: this.context,
      message,
      ...(data && { data }),
    };

    return config.nodeEnv === 'production'
      ? JSON.stringify(logData)
      : `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${data ? ' ' + JSON.stringify(data, null, 2) : ''}`;
  }

  error(message, error = null) {
    if (LOG_LEVELS.error <= currentLevel) {
      const errorData = error ? {
        message: error.message,
        stack: error.stack,
        ...(error.code && { code: error.code }),
      } : null;
      console.error(this.formatMessage('error', message, errorData));
    }
  }

  warn(message, data = null) {
    if (LOG_LEVELS.warn <= currentLevel) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  info(message, data = null) {
    if (LOG_LEVELS.info <= currentLevel) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  debug(message, data = null) {
    if (LOG_LEVELS.debug <= currentLevel && config.nodeEnv === 'development') {
      console.log(this.formatMessage('debug', message, data));
    }
  }
}

function createLogger(context) {
  return new Logger(context);
}

module.exports = { Logger, createLogger };

