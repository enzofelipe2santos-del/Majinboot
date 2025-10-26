const { Router } = require('express');
const statsController = require('../controllers/statsController');

const router = Router();

router.get('/:sessionId', statsController.getSessionStats);

module.exports = router;
