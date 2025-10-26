const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const settings = require('../config/settings');
const routes = require('./routes');
const sessionManager = require('./services/sessionManager');
const logger = require('./utils/logger');
const { ensureDirectories } = require('./utils/fileSystem');
const { scheduleAutomaticBackups } = require('./utils/backupManager');

ensureDirectories();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api', routes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

sessionManager.bindSocket(io);
sessionManager.loadPersistedSessions().forEach((session) => {
  try {
    sessionManager.createSession(session);
  } catch (error) {
    logger.warn(`No se pudo iniciar sesión persistida ${session.id}: ${error.message}`);
  }
});

scheduleAutomaticBackups();

server.listen(settings.app.backendPort, () => {
  logger.info(`API disponible en http://localhost:${settings.app.backendPort}`);
});

module.exports = app;
