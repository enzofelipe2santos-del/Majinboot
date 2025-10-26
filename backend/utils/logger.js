const chalk = require('chalk');

const logger = {
  info: (message) => console.log(chalk.cyan('[INFO]'), message),
  warn: (message) => console.warn(chalk.yellow('[WARN]'), message),
  error: (message, error) => console.error(chalk.red('[ERROR]'), message, error || ''),
};

module.exports = logger;
