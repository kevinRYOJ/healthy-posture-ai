const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/healthScoreController');

router.get('/', auth, c.getScore);
router.post('/', auth, c.saveScore);

module.exports = router;