const triggerService = require('../services/triggerService');

exports.listTriggers = (req, res) => {
  res.json(triggerService.listTriggers(req.params.sessionId));
};

exports.createTrigger = (req, res) => {
  try {
    const trigger = triggerService.createTrigger(req.params.sessionId, req.body);
    res.status(201).json(trigger);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTrigger = (req, res) => {
  try {
    const trigger = triggerService.updateTrigger(req.params.sessionId, req.params.triggerId, req.body);
    res.json(trigger);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTrigger = (req, res) => {
  try {
    triggerService.deleteTrigger(req.params.sessionId, req.params.triggerId);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.testTrigger = async (req, res) => {
  try {
    const trigger = await triggerService.resolveTrigger(req.params.sessionId, req.body.message);
    if (!trigger) {
      return res.status(404).json({ message: 'No se encontró trigger' });
    }
    return res.json(trigger);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
