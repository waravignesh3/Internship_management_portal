const express = require('express');
const router = express.Router();
const { getProgress, submitProgress } = require('../controllers/progressController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getProgress);
router.post('/', authenticateToken, submitProgress);

module.exports = router;
