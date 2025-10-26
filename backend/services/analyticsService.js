const path = require('path');
const fs = require('fs');
const settings = require('../../config/settings');

function getStatsPath(sessionId) {
  return path.join(settings.sessionsDir, sessionId, 'stats.json');
}

function loadStats(sessionId) {
  const file = getStatsPath(sessionId);
  if (!fs.existsSync(file)) {
    return { messagesReceived: 0, messagesSent: 0, triggersUsed: {}, hoursActive: [] };
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function incrementStat(sessionId, key, triggerId) {
  const stats = loadStats(sessionId);
  if (key === 'messagesReceived') stats.messagesReceived += 1;
  if (key === 'messagesSent') stats.messagesSent += 1;
  if (key === 'trigger' && triggerId) {
    stats.triggersUsed[triggerId] = (stats.triggersUsed[triggerId] || 0) + 1;
  }
  fs.writeFileSync(getStatsPath(sessionId), JSON.stringify(stats, null, 2));
  return stats;
}

module.exports = {
  loadStats,
  incrementStat,
};
