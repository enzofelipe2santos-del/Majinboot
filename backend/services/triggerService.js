const path = require('path');
const fs = require('fs');
const Fuse = require('fuse.js');
const stringSimilarity = require('string-similarity');
const { MessageMedia } = require('whatsapp-web.js');
const settings = require('../../config/settings');
const { verifyMediaPath } = require('../utils/fileSystem');
const { interpolate } = require('../utils/placeholders');
const reminderService = require('./reminderService');

const triggersCache = new Map();
const unknownMessages = new Map();

function getTriggerPath(sessionId) {
  return path.join(settings.sessionsDir, sessionId, 'triggers.json');
}

function loadTriggers(sessionId) {
  const file = getTriggerPath(sessionId);
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  triggersCache.set(sessionId, data);
  return data;
}

function saveTriggers(sessionId, triggers) {
  const file = getTriggerPath(sessionId);
  fs.writeFileSync(file, JSON.stringify(triggers, null, 2));
  triggersCache.set(sessionId, triggers);
}

function listTriggers(sessionId) {
  return triggersCache.get(sessionId) || loadTriggers(sessionId);
}

function createTrigger(sessionId, payload) {
  const triggers = listTriggers(sessionId);
  const trigger = {
    id: payload.id || `trigger-${Date.now()}`,
    name: payload.name,
    match: payload.match,
    matchType: payload.matchType || 'fuzzy',
    category: payload.category || 'General',
    similarity: payload.similarity ?? 0.5,
    responses: payload.responses || [],
    reminders: payload.reminders || [],
  };
  triggers.push(trigger);
  saveTriggers(sessionId, triggers);
  return trigger;
}

function updateTrigger(sessionId, triggerId, payload) {
  const triggers = listTriggers(sessionId);
  const index = triggers.findIndex((item) => item.id === triggerId);
  if (index === -1) throw new Error('Trigger no encontrado');
  triggers[index] = { ...triggers[index], ...payload };
  saveTriggers(sessionId, triggers);
  return triggers[index];
}

function deleteTrigger(sessionId, triggerId) {
  const triggers = listTriggers(sessionId);
  const filtered = triggers.filter((item) => item.id !== triggerId);
  saveTriggers(sessionId, filtered);
}

function registerUnknownMessage(sessionId, text) {
  if (!unknownMessages.has(sessionId)) {
    unknownMessages.set(sessionId, []);
  }
  unknownMessages.get(sessionId).push({ text, at: new Date().toISOString() });
  const file = path.join(settings.sessionsDir, sessionId, 'unknown.json');
  fs.writeFileSync(file, JSON.stringify(unknownMessages.get(sessionId), null, 2));
}

function buildFuseIndex(triggers) {
  return new Fuse(triggers, {
    keys: ['match'],
    threshold: 0.4,
  });
}

async function resolveTrigger(sessionId, message) {
  const triggers = listTriggers(sessionId);
  if (!triggers.length) return null;

  const exact = triggers.find((trigger) => trigger.matchType === 'exact'
    ? trigger.match.toLowerCase() === message.toLowerCase()
    : trigger.match === message);
  if (exact) return exact;

  const fuse = buildFuseIndex(triggers);
  const result = fuse.search(message)[0];
  if (result && result.score <= (1 - (result.item.similarity ?? 0.5))) {
    return result.item;
  }

  const matches = triggers.map((trigger) => ({
    trigger,
    score: stringSimilarity.compareTwoStrings(trigger.match.toLowerCase(), message.toLowerCase()),
  }));

  matches.sort((a, b) => b.score - a.score);
  if (matches[0] && matches[0].score >= (matches[0].trigger.similarity ?? 0.5)) {
    return matches[0].trigger;
  }

  return null;
}

const analyticsService = require('./analyticsService');

async function executeResponses(sessionId, trigger, message, client) {
  for (const response of trigger.responses) {
    if (response.type === 'text') {
      const content = interpolate(response.content, { name: message._data?.notifyName });
      await client.sendMessage(message.from, content);
      analyticsService.incrementStat(sessionId, 'messagesSent');
    } else if (['image', 'video', 'audio', 'document', 'pdf'].includes(response.type)) {
      if (verifyMediaPath(response.path)) {
        const media = await MessageMedia.fromFilePath(response.path);
        await client.sendMessage(message.from, media, { caption: response.caption || '' });
        analyticsService.incrementStat(sessionId, 'messagesSent');
      }
    }
  }

  reminderService.scheduleReminders(sessionId, trigger, message.from, message._data);
}

module.exports = {
  listTriggers,
  createTrigger,
  updateTrigger,
  deleteTrigger,
  resolveTrigger,
  executeResponses,
  registerUnknownMessage,
  loadTriggers,
};
