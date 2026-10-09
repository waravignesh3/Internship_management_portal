const express = require('express');
const router = express.Router();
const { getBookmarks, toggleBookmark } = require('../controllers/bookmarkController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, requireRole('STUDENT'), getBookmarks);
router.post('/toggle', authenticateToken, requireRole('STUDENT'), toggleBookmark);

module.exports = router;
