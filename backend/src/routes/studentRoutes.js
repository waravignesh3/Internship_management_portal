const express = require('express');
const router = express.Router();
const { getStudentDashboard, getStudentProfile, updateStudentProfile } = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/dashboard', authenticateToken, requireRole('STUDENT'), getStudentDashboard);
router.get('/profile', authenticateToken, requireRole('STUDENT'), getStudentProfile);
router.put('/profile', authenticateToken, requireRole('STUDENT'), updateStudentProfile);

module.exports = router;
