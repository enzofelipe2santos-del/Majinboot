const { Router } = require('express');
const triggersController = require('../controllers/triggersController');

const router = Router();

router.get('/:sessionId', triggersController.listTriggers);
router.post('/:sessionId', triggersController.createTrigger);
router.put('/:sessionId/:triggerId', triggersController.updateTrigger);
router.delete('/:sessionId/:triggerId', triggersController.deleteTrigger);
router.post('/:sessionId/:triggerId/test', triggersController.testTrigger);

module.exports = router;
