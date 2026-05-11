const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/sessionController');

router.post('/', auth, c.startSession);
router.put('/:id/stop', auth, c.stopSession);
router.post('/break', auth, c.recordBreak);
router.get('/', auth, c.getSessions);

module.exports = router;