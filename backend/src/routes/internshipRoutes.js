const express = require('express');
const router = express.Router();
const { getInternships, getInternshipById, createInternship, updateInternship, deleteInternship } = require('../controllers/internshipController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', getInternships);
router.get('/:id', getInternshipById);
router.post('/', authenticateToken, requireRole('COMPANY', 'ADMIN'), createInternship);
router.put('/:id', authenticateToken, requireRole('COMPANY', 'ADMIN'), updateInternship);
router.delete('/:id', authenticateToken, requireRole('COMPANY', 'ADMIN'), deleteInternship);

module.exports = router;
