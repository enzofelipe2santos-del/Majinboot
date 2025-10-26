const sqlite3 = require('sqlite3').verbose();
const settings = require('../../config/settings');

const db = new sqlite3.Database(settings.database.path, (err) => {
  if (err) {
    console.error('Error al conectar la base de datos', err);
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    direction TEXT,
    phone TEXT,
    body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
