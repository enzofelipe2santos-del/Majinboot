const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const settings = require('../../config/settings');
const logger = require('../utils/logger');
const triggerService = require('./triggerService');
const reminderService = require('./reminderService');
const analyticsService = require('./analyticsService');

const sessions = new Map();
let io;

const sessionsRoot = path.resolve(__dirname, '../../', settings.sessionsDir);
const authRoot = path.join(sessionsRoot, 'auth');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(sessionsRoot);
ensureDir(authRoot);

function getSessionDir(sessionId) {
  const dir = path.join(sessionsRoot, sessionId);
  ensureDir(dir);
  return dir;
}

function getConfigPath(sessionId) {
  return path.join(getSessionDir(sessionId), 'config.json');
}

function serializeSession(session) {
  return {
    id: session.id,
    name: session.name,
    status: session.status,
    paused: session.paused,
  };
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
  return Array.from(sessions.values()).map(serializeSession);
}

function loadPersistedSessions() {
  if (!fs.existsSync(sessionsRoot)) return [];
  return fs
    .readdirSync(sessionsRoot)
    .filter((folder) => {
      const dir = path.join(sessionsRoot, folder);
      return fs.statSync(dir).isDirectory() && folder !== 'auth';
    })
    .map((id) => {
      const configPath = getConfigPath(id);
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      return { id, name: id, status: 'disconnected', paused: false };
    });
}

function persistSessionConfig(session) {
  const data = serializeSession(session);
  const configPath = getConfigPath(session.id);
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

function createSession({ id, name }) {
  if (sessions.has(id)) {
    throw new Error('La sesión ya existe');
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: id, dataPath: authRoot }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    qrMaxRetries: 6,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 60000,
  });

  const session = {
    id,
    name,
    status: 'connecting',
    paused: false,
    client,
    lastQr: null,
  };

  sessions.set(id, session);
  persistSessionConfig(session);
  emit('session:created', serializeSession(session));

  client.on('qr', (qr) => {
    session.status = 'qr';
    session.lastQr = qr;
    persistSessionConfig(session);
    qrcode.generate(qr, { small: true });
    emit('session:qr', { id, qr });
    emit('session:log', {
      id,
      level: 'info',
      message: 'QR generado, escanéalo para iniciar sesión.',
      timestamp: new Date().toISOString(),
    });
  });

  client.on('loading_screen', (percent, message) => {
    emit('session:log', {
      id,
      level: 'info',
      message: `Inicializando (${percent}%): ${message}`,
      timestamp: new Date().toISOString(),
    });
  });

  client.on('authenticated', () => {
    session.status = 'authenticated';
    persistSessionConfig(session);
    emit('session:log', {
      id,
      level: 'info',
      message: 'Autenticación completada, esperando confirmación de WhatsApp...',
      timestamp: new Date().toISOString(),
    });
  });

  client.on('ready', () => {
    session.status = 'ready';
    session.lastQr = null;
    persistSessionConfig(session);
    emit('session:ready', serializeSession(session));
    emit('session:log', {
      id,
      level: 'info',
      message: 'Sesión conectada correctamente.',
      timestamp: new Date().toISOString(),
    });
  });

  client.on('disconnected', (reason) => {
    session.status = 'disconnected';
    persistSessionConfig(session);
    emit('session:disconnected', { ...serializeSession(session), reason });
    emit('session:log', {
      id,
      level: 'warn',
      message: `Sesión desconectada (${reason}). Reintentando...`,
      timestamp: new Date().toISOString(),
    });
    setTimeout(() => {
      client
        .initialize()
        .catch((error) => {
          session.status = 'error';
          persistSessionConfig(session);
          emit('session:error', {
            id,
            level: 'error',
            message: error.message,
            timestamp: new Date().toISOString(),
          });
        });
    }, 2000);
  });

  client.on('auth_failure', (message) => {
    session.status = 'auth_failure';
    persistSessionConfig(session);
    emit('session:error', {
      id,
      level: 'error',
      message: `Error de autenticación: ${message}`,
      timestamp: new Date().toISOString(),
    });
  });

  client.on('message', async (message) => {
    if (session.paused) return;
    analyticsService.incrementStat(id, 'messagesReceived');
    const trigger = await triggerService.resolveTrigger(id, message.body);
    if (trigger) {
      emit('session:log', {
        id,
        level: 'info',
        message: `Trigger ejecutado: ${trigger.name}`,
        timestamp: new Date().toISOString(),
      });
      await triggerService.executeResponses(id, trigger, message, client);
      analyticsService.incrementStat(id, 'trigger', trigger.id);
      reminderService.registerInteraction(id, message.from, trigger);
    } else {
      triggerService.registerUnknownMessage(id, message.body);
    }
  });

  client.initialize().catch((error) => {
    session.status = 'error';
    persistSessionConfig(session);
    logger.error('Error inicializando sesión', error);
    emit('session:error', {
      id,
      level: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  });

  return serializeSession(session);
}

async function startSession(id) {
  let session = sessions.get(id);
  if (!session) {
    const stored = loadPersistedSessions().find((item) => item.id === id);
    if (!stored) throw new Error('Sesión no encontrada');
    const created = createSession(stored);
    session = sessions.get(created.id);
  }

  session.paused = false;
  if (session.status === 'disconnected' || session.status === 'error') {
    session.status = 'connecting';
    persistSessionConfig(session);
    session.client.initialize().catch((error) => {
      session.status = 'error';
      persistSessionConfig(session);
      emit('session:error', {
        id,
        level: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    });
  } else {
    persistSessionConfig(session);
  }

  emit('session:resumed', serializeSession(session));
  return serializeSession(session);
}

function pauseSession(id) {
  const session = sessions.get(id);
  if (!session) throw new Error('Sesión no encontrada');
  session.paused = true;
  persistSessionConfig(session);
  emit('session:paused', serializeSession(session));
  return serializeSession(session);
}

function resumeSession(id) {
  const session = sessions.get(id);
  if (!session) throw new Error('Sesión no encontrada');
  session.paused = false;
  persistSessionConfig(session);
  emit('session:resumed', serializeSession(session));
  return serializeSession(session);
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
  const authPath = path.join(authRoot, `session-${id}`);
  if (fs.existsSync(authPath)) {
    fs.rmSync(authPath, { recursive: true, force: true });
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
