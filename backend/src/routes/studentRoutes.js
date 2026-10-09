const express = require('express');
const router = express.Router();
const { getStudentDashboard, updateStudentProfile } = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/dashboard', authenticateToken, requireRole('STUDENT'), getStudentDashboard);
router.put('/profile', authenticateToken, requireRole('STUDENT'), updateStudentProfile);

module.exports = router;
