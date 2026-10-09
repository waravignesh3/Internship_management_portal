const express = require('express');
const router = express.Router();
const { getAdminDashboard, getAnalytics, getActivityLogs, toggleUserActive } = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/dashboard', authenticateToken, requireRole('ADMIN'), getAdminDashboard);
router.get('/analytics', authenticateToken, requireRole('ADMIN'), getAnalytics);
router.get('/activity-logs', authenticateToken, requireRole('ADMIN'), getActivityLogs);
router.put('/users/:userId/toggle', authenticateToken, requireRole('ADMIN'), toggleUserActive);

module.exports = router;
