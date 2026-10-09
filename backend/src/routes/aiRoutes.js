const express = require('express');
const router = express.Router();
const { chat, skillGap, resumeAssistant, careerAdvisor, interviewPrep, projectRecommendations } = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

router.post('/chat', authenticateToken, chat);
router.post('/skill-gap', authenticateToken, skillGap);
router.post('/resume', authenticateToken, resumeAssistant);
router.post('/career', authenticateToken, careerAdvisor);
router.post('/interview', authenticateToken, interviewPrep);
router.post('/projects', authenticateToken, projectRecommendations);

module.exports = router;
