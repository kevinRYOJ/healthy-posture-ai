const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', auth, c.getMe);
router.put('/profile', auth, c.updateProfile);

module.exports = router;