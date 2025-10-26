const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { CronJob } = require('cron');
const settings = require('../../config/settings');
const logger = require('./logger');

/**
 * Compresses the sessions and configuration data into a zip-like archive.
 */
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(settings.database.backupDir, `backup-${timestamp}.gz`);
  const source = JSON.stringify({
    sessions: fs.readdirSync(settings.sessionsDir),
  });

  const buffer = zlib.gzipSync(source);
  fs.writeFileSync(backupPath, buffer);
  logger.info(`Backup created at ${backupPath}`);
}

let job;

function scheduleAutomaticBackups() {
  if (job) return;
  job = new CronJob(`0 */${settings.database.backupIntervalHours} * * *`, createBackup);
  job.start();
  logger.info('Automatic backups scheduled.');
}

module.exports = {
  createBackup,
  scheduleAutomaticBackups,
};
