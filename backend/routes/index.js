const { Router } = require('express');
const sessionRoutes = require('./sessionRoutes');
const triggerRoutes = require('./triggerRoutes');
const reminderRoutes = require('./reminderRoutes');
const statsRoutes = require('./statsRoutes');

const router = Router();

router.use('/sessions', sessionRoutes);
router.use('/triggers', triggerRoutes);
router.use('/reminders', reminderRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
