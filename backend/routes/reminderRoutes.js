const { Router } = require('express');
const remindersController = require('../controllers/remindersController');

const router = Router();

router.get('/:sessionId', remindersController.listReminders);
router.post('/:sessionId', remindersController.createReminder);
router.put('/:sessionId/:reminderId', remindersController.updateReminder);
router.delete('/:sessionId/:reminderId', remindersController.deleteReminder);

module.exports = router;
