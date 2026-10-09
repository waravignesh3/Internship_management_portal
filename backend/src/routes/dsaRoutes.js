const express = require('express');
const router = express.Router();
const { handleMatch, handleAllocate, handleGraph, handleStats } = require('../controllers/dsaController');

router.post('/match', handleMatch);
router.post('/allocate', handleAllocate);
router.post('/graph', handleGraph);
router.get('/stats', handleStats);

module.exports = router;
