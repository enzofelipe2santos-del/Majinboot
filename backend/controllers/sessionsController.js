const sessionManager = require('../services/sessionManager');

exports.listSessions = (req, res) => {
  const sessions = sessionManager.listSessions();
  const persisted = sessionManager.loadPersistedSessions();
  const merged = persisted.map((session) => ({
    ...session,
    ...(sessions.find((item) => item.id === session.id) || {}),
  }));
  res.json(merged);
};

exports.createSession = (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }
  try {
    const session = sessionManager.createSession({ id, name });
    return res.status(201).json(session);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.startSession = (req, res) => {
  try {
    const session = sessionManager.startSession(req.params.id);
    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.pauseSession = (req, res) => {
  try {
    const session = sessionManager.pauseSession(req.params.id);
    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.resumeSession = (req, res) => {
  try {
    const session = sessionManager.resumeSession(req.params.id);
    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSession = (req, res) => {
  try {
    sessionManager.deleteSession(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
