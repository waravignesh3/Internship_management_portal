const express = require('express');
const router = express.Router();
const { getCompanyDashboard, getApplicants, allocateSeats } = require('../controllers/companyController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/dashboard', authenticateToken, requireRole('COMPANY', 'ADMIN'), getCompanyDashboard);
router.get('/applicants', authenticateToken, requireRole('COMPANY', 'ADMIN'), getApplicants);
router.post('/allocate-seats', authenticateToken, requireRole('COMPANY', 'ADMIN'), allocateSeats);

module.exports = router;
