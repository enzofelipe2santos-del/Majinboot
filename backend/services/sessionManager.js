const path = require('path');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const settings = require('../../config/settings');
const logger = require('../utils/logger');
const triggerService = require('./triggerService');
const reminderService = require('./reminderService');
const analyticsService = require('./analyticsService');

const sessions = new Map();
let io;

function getSessionDir(sessionId) {
  return path.join(settings.sessionsDir, sessionId);
}

function bindSocket(server) {
  io = server;
}

function emit(event, payload) {
  if (io) {
    io.emit(event, payload);
  }
}

function listSessions() {
  return Array.from(sessions.values()).map((session) => ({
    id: session.id,
    name: session.name,
    status: session.status,
    paused: session.paused,
  }));
}

function loadPersistedSessions() {
  if (!fs.existsSync(settings.sessionsDir)) return [];
  return fs
    .readdirSync(settings.sessionsDir)
    .filter((folder) => fs.statSync(path.join(settings.sessionsDir, folder)).isDirectory())
    .map((id) => {
      const configPath = path.join(getSessionDir(id), 'config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config;
      }
      return { id, name: id, status: 'disconnected', paused: false };
    });
}

function persistSessionConfig(session) {
  const dir = getSessionDir(session.id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify(session, null, 2));
}

function createSession({ id, name }) {
  if (sessions.has(id)) {
    throw new Error('La sesión ya existe');
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: id, dataPath: getSessionDir(id) }),
    puppeteer: {
      headless: true,
    },
  });

  const session = {
    id,
    name,
    status: 'connecting',
    paused: false,
    client,
  };

  sessions.set(id, session);
  persistSessionConfig({ id, name, status: 'connecting', paused: false });
  emit('session:created', { id, name });

  client.on('qr', (qr) => {
    emit('session:qr', { id, qr });
    emit('session:log', { id, level: 'info', message: 'QR generado, escanéalo para iniciar sesión.', timestamp: new Date().toISOString() });
  });

  client.on('ready', () => {
    session.status = 'ready';
    persistSessionConfig({ id, name, status: 'ready', paused: false });
    emit('session:ready', { id });
    emit('session:log', { id, level: 'info', message: 'Sesión conectada correctamente.', timestamp: new Date().toISOString() });
  });

  client.on('message', async (message) => {
    if (session.paused) return;
    analyticsService.incrementStat(id, 'messagesReceived');
    const trigger = await triggerService.resolveTrigger(id, message.body);
    if (trigger) {
    emit('session:log', { id, level: 'info', message: `Trigger ejecutado: ${trigger.name}`, timestamp: new Date().toISOString() });
      await triggerService.executeResponses(id, trigger, message, client);
      analyticsService.incrementStat(id, 'trigger', trigger.id);
      reminderService.registerInteraction(id, message.from, trigger);
    } else {
      triggerService.registerUnknownMessage(id, message.body);
    }
  });

  client.initialize().catch((error) => {
    logger.error('Error inicializando sesión', error);
    emit('session:error', { id, level: 'error', message: error.message, timestamp: new Date().toISOString() });
  });

  return session;
}

async function startSession(id) {
  let session = sessions.get(id);
  if (!session) {
    const stored = loadPersistedSessions().find((item) => item.id === id);
    if (!stored) throw new Error('Sesión no encontrada');
    session = createSession(stored);
  }
  session.paused = false;
  session.status = 'ready';
  persistSessionConfig({ id: session.id, name: session.name, status: session.status, paused: session.paused });
  emit('session:resumed', { id });
  return session;
}

function pauseSession(id) {
  const session = sessions.get(id);
  if (!session) throw new Error('Sesión no encontrada');
  session.paused = true;
  persistSessionConfig({ id: session.id, name: session.name, status: session.status, paused: session.paused });
  emit('session:paused', { id });
  return session;
}

function resumeSession(id) {
  const session = sessions.get(id);
  if (!session) throw new Error('Sesión no encontrada');
  session.paused = false;
  persistSessionConfig({ id: session.id, name: session.name, status: session.status, paused: session.paused });
  emit('session:resumed', { id });
  return session;
}

function deleteSession(id) {
  const session = sessions.get(id);
  if (session) {
    session.client.destroy();
    sessions.delete(id);
  }
  const dir = getSessionDir(id);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  emit('session:deleted', { id });
}

module.exports = {
  bindSocket,
  createSession,
  listSessions,
  startSession,
  pauseSession,
  resumeSession,
  deleteSession,
  loadPersistedSessions,
};
