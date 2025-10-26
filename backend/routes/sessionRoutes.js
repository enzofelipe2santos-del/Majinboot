const { Router } = require('express');
const sessionsController = require('../controllers/sessionsController');

const router = Router();

router.get('/', sessionsController.listSessions);
router.post('/', sessionsController.createSession);
router.post('/:id/start', sessionsController.startSession);
router.post('/:id/pause', sessionsController.pauseSession);
router.post('/:id/resume', sessionsController.resumeSession);
router.delete('/:id', sessionsController.deleteSession);

module.exports = router;
