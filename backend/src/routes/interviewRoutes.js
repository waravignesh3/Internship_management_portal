const express = require('express');
const router = express.Router();
const { scheduleInterview, getInterviews } = require('../controllers/interviewController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, scheduleInterview);
router.get('/', authenticateToken, getInterviews);

module.exports = router;
