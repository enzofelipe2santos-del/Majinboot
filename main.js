const path = require('path');
const { app, BrowserWindow, nativeTheme, ipcMain, Notification } = require('electron');
const isDev = !app.isPackaged;
const settings = require('./config/settings');
const { ensureDirectories } = require('./backend/utils/fileSystem');
const { scheduleAutomaticBackups } = require('./backend/utils/backupManager');

/**
 * Creates the main renderer window for Majinboot.
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0b1220' : '#f4f6fb',
    show: false,
    title: settings.app.name,
    vibrancy: 'under-window',
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  const startUrl = process.env.FRONTEND_URL
    || `file://${path.join(__dirname, 'frontend', 'dist', 'index.html')}`;
  win.loadURL(startUrl);

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(async () => {
  ensureDirectories();
  scheduleAutomaticBackups();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('notify', (_, { title, body }) => {
  new Notification({ title: title || settings.app.name, body }).show();
});
