const fs = require('fs');
const path = require('path');
const settings = require('../../config/settings');

const requiredDirectories = [
  settings.sessionsDir,
  path.dirname(settings.database.path),
  settings.database.backupDir,
];

/**
 * Ensures required directories exist at runtime to avoid runtime errors.
 */
function ensureDirectories() {
  requiredDirectories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Validates whether a media file exists on disk.
 * @param {string} filePath
 */
function verifyMediaPath(filePath) {
  if (!filePath) return false;
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

module.exports = {
  ensureDirectories,
  verifyMediaPath,
};
