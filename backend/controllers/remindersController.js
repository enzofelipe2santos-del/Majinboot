const reminderService = require('../services/reminderService');

exports.listReminders = (req, res) => {
  res.json(reminderService.listReminders(req.params.sessionId));
};

exports.createReminder = (req, res) => {
  try {
    const reminder = reminderService.createReminder(req.params.sessionId, req.body);
    res.status(201).json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReminder = (req, res) => {
  try {
    const reminder = reminderService.updateReminder(req.params.sessionId, req.params.reminderId, req.body);
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteReminder = (req, res) => {
  try {
    reminderService.deleteReminder(req.params.sessionId, req.params.reminderId);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
