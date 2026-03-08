const fs = require('fs').promises;

class Logger {
  constructor(logFile) {
    this.logFile = logFile;
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    // await fs.appendFile(this.logFile, logMessage);
  }
}

module.exports = Logger;