const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/sessionController');

router.get('/', auth, c.getSessions);
router.post('/', auth, c.createSession);
router.delete('/', auth, c.deleteAllSessions);

// Route lama tetap ada
router.post('/start', auth, c.startSession);
router.put('/:id/stop', auth, c.stopSession);
router.post('/break', auth, c.recordBreak);

module.exports = router;
