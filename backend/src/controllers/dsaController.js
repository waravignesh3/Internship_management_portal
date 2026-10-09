const dsaService = require('../services/dsaService');
const { query } = require('../config/db');

async function handleMatch(req, res) {
  try {
    const { studentProfile, internships } = req.body;
    const result = await dsaService.matchInternships(
      studentProfile || { full_name: 'Sample Student', cgpa: 8.5, skills: ['C++', 'DSA', 'SQL', 'React'] },
      internships || []
    );
    return res.json(result);
  } catch (error) {
    console.error('dsa match error:', error);
    return res.status(500).json({ success: false, error: 'DSA match failed.' });
  }
}

async function handleAllocate(req, res) {
  try {
    const { totalSeats, candidates } = req.body;
    const result = await dsaService.allocateSeats(totalSeats || 3, candidates || []);
    return res.json(result);
  } catch (error) {
    console.error('dsa allocate error:', error);
    return res.status(500).json({ success: false, error: 'DSA allocation failed.' });
  }
}

async function handleGraph(req, res) {
  try {
    const { skill } = req.body;
    const result = await dsaService.getSkillGraph(skill || 'C++');
    return res.json(result);
  } catch (error) {
    console.error('dsa graph error:', error);
    return res.status(500).json({ success: false, error: 'DSA graph operation failed.' });
  }
}

async function handleStats(req, res) {
  try {
    const health = await dsaService.checkHealth();
    return res.json({
      success: true,
      health,
      algorithms: [
        { name: 'Custom HashMap Lookup', complexity: 'O(1) Avg', status: 'ACTIVE' },
        { name: 'Skill Relationship Graph (BFS / DFS)', complexity: 'O(V + E)', status: 'ACTIVE' },
        { name: 'Priority Queue (Max Heap) Ranking', complexity: 'O(N log N)', status: 'ACTIVE' },
        { name: 'Greedy Seat Allocation Engine', complexity: 'O(K log K)', status: 'ACTIVE' },
        { name: 'MergeSort / QuickSort Candidates', complexity: 'O(N log N)', status: 'ACTIVE' },
        { name: 'Binary / Linear Search Filtering', complexity: 'O(log N) / O(N)', status: 'ACTIVE' }
      ]
    });
  } catch (error) {
    console.error('dsa stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch DSA stats.' });
  }
}

module.exports = { handleMatch, handleAllocate, handleGraph, handleStats };
