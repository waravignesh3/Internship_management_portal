const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getNotifications);
router.put('/:id/read', authenticateToken, markAsRead);

module.exports = router;
