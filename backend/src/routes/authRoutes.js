const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out successfully.' }));
router.get('/me', authenticateToken, getMe);

module.exports = router;
