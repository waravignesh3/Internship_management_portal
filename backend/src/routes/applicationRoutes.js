const express = require('express');
const router = express.Router();
const { applyToInternship, getMyApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/', authenticateToken, requireRole('STUDENT'), applyToInternship);
router.get('/my', authenticateToken, requireRole('STUDENT'), getMyApplications);
router.put('/:id/status', authenticateToken, requireRole('COMPANY', 'ADMIN'), updateApplicationStatus);

module.exports = router;
