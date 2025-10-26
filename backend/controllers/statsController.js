const analyticsService = require('../services/analyticsService');

exports.getSessionStats = (req, res) => {
  try {
    const stats = analyticsService.loadStats(req.params.sessionId);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
