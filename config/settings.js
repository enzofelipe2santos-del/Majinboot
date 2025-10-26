/**
 * Global settings for the Majinboot application. These settings are shared by the
 * Electron shell, backend API and the frontend renderer.
 */
module.exports = {
  app: {
    name: 'Majinboot',
    version: '0.1.0',
    frontendDevPort: 5173,
    backendPort: 4010,
    socketPort: 4011,
  },
  sessionsDir: 'sessions',
  database: {
    path: 'database/majinboot.db',
    backupDir: 'database/backups',
    backupIntervalHours: 24,
  },
  security: {
    defaultSessionPin: null,
    cooldownSeconds: 30,
  },
};
