const path = require('path');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const settings = require('../../config/settings');
const logger = require('../utils/logger');
const { verifyMediaPath } = require('../utils/fileSystem');

const remindersBySession = new Map();
const pendingReminders = new Map();

function getReminderPath(sessionId) {
  return path.join(settings.sessionsDir, sessionId, 'reminders.json');
}

function loadReminders(sessionId) {
  const file = getReminderPath(sessionId);
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  remindersBySession.set(sessionId, data);
  return data;
}

function saveReminders(sessionId, reminders) {
  fs.writeFileSync(getReminderPath(sessionId), JSON.stringify(reminders, null, 2));
  remindersBySession.set(sessionId, reminders);
}

function listReminders(sessionId) {
  return remindersBySession.get(sessionId) || loadReminders(sessionId);
}

function createReminder(sessionId, payload) {
  const reminders = listReminders(sessionId);
  const reminder = {
    id: payload.id || `reminder-${Date.now()}`,
    triggerId: payload.triggerId,
    delayMinutes: payload.delayMinutes || 60,
    responses: payload.responses || [],
  };
  reminders.push(reminder);
  saveReminders(sessionId, reminders);
  return reminder;
}

function updateReminder(sessionId, reminderId, payload) {
  const reminders = listReminders(sessionId);
  const index = reminders.findIndex((item) => item.id === reminderId);
  if (index === -1) throw new Error('Recordatorio no encontrado');
  reminders[index] = { ...reminders[index], ...payload };
  saveReminders(sessionId, reminders);
  return reminders[index];
}

function deleteReminder(sessionId, reminderId) {
  const reminders = listReminders(sessionId);
  const filtered = reminders.filter((item) => item.id !== reminderId);
  saveReminders(sessionId, filtered);
}

function registerInteraction(sessionId, contact, trigger) {
  if (!pendingReminders.has(sessionId)) {
    pendingReminders.set(sessionId, new Map());
  }
  const sessionPending = pendingReminders.get(sessionId);
  const timeout = sessionPending.get(contact);
  if (timeout) {
    clearTimeout(timeout);
    sessionPending.delete(contact);
  }
  logger.info(`Se cancelaron recordatorios para ${contact} en ${sessionId}`);
}

function scheduleReminders(sessionId, trigger, contact, metadata) {
  const reminders = listReminders(sessionId).filter((item) => item.triggerId === trigger.id);
  if (!reminders.length) return;

  if (!pendingReminders.has(sessionId)) {
    pendingReminders.set(sessionId, new Map());
  }

  const sessionPending = pendingReminders.get(sessionId);

  reminders.forEach((reminder) => {
    const delay = reminder.delayMinutes * 60 * 1000;
    const timeout = setTimeout(async () => {
      const sessionManager = require('./sessionManager');
      const session = sessionManager.loadPersistedSessions().find((item) => item.id === sessionId);
      if (!session) return;
      try {
        const clientSession = await sessionManager.startSession(sessionId);
        const client = clientSession.client;
        for (const response of reminder.responses) {
          if (response.type === 'text') {
            await client.sendMessage(contact, response.content);
          } else if (['image', 'video', 'audio', 'document', 'pdf'].includes(response.type) && verifyMediaPath(response.path)) {
            const media = await MessageMedia.fromFilePath(response.path);
            await client.sendMessage(contact, media, { caption: response.caption || '' });
          }
        }
        logger.info(`Recordatorio enviado a ${contact} (${trigger.name})`);
      } catch (error) {
        logger.error('Error enviando recordatorio', error);
      }
    }, delay);
    sessionPending.set(contact, timeout);
  });
}

module.exports = {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  registerInteraction,
  scheduleReminders,
};
