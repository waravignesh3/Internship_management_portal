const { query } = require('../config/db');
const dsaService = require('../services/dsaService');

async function getCompanyDashboard(req, res) {
  try {
    const cRes = await query('SELECT * FROM companies WHERE user_id = $1', [req.user.id]);
    if (cRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Company profile not found.' });
    }
    const company = cRes[0];

    const internships = await query('SELECT * FROM internships WHERE company_id = $1 ORDER BY created_at DESC', [company.id]);

    const activeCount = internships.filter(i => i.is_published === 1 || i.is_published === true).length;
    const totalSeats = internships.reduce((sum, i) => sum + (i.available_seats || 1), 0);

    const applicants = await query(
      `SELECT a.*, s.full_name, s.college_name, s.cgpa, s.department, s.user_id, i.title as internship_title, i.min_cgpa
       FROM applications a
       JOIN internships i ON a.internship_id = i.id
       JOIN students s ON a.student_id = s.id
       WHERE i.company_id = $1 ORDER BY a.applied_at DESC`,
      [company.id]
    );

    const shortlistedCount = applicants.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
    const selectedCount = applicants.filter(a => a.status === 'SELECTED').length;

    return res.json({
      success: true,
      company,
      stats: {
        activeInternships: activeCount,
        totalApplicants: applicants.length,
        shortlisted: shortlistedCount,
        selected: selectedCount,
        remainingSeats: Math.max(0, totalSeats - selectedCount)
      },
      internships,
      recentApplicants: applicants.slice(0, 10)
    });
  } catch (error) {
    console.error('getCompanyDashboard error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load company dashboard.' });
  }
}

async function getApplicants(req, res) {
  try {
    const cRes = await query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
    if (cRes.length === 0) return res.status(404).json({ success: false, error: 'Company not found.' });
    const companyId = cRes[0].id;

    const applicants = await query(
      `SELECT a.*, s.full_name, s.college_name, s.cgpa, s.department, s.phone, s.resume_url, i.title as internship_title, i.min_cgpa, i.available_seats
       FROM applications a
       JOIN internships i ON a.internship_id = i.id
       JOIN students s ON a.student_id = s.id
       WHERE i.company_id = $1 ORDER BY a.match_score DESC, s.cgpa DESC`,
      [companyId]
    );

    for (const app of applicants) {
      const skills = await query(
        `SELECT sk.name FROM student_skills ss JOIN skills sk ON ss.skill_id = sk.id WHERE ss.student_id = $1`,
        [app.student_id]
      );
      app.student_skills = skills.map(s => s.name);
      app.isEligible = parseFloat(app.cgpa) >= parseFloat(app.min_cgpa);
    }

    return res.json({ success: true, applicants });
  } catch (error) {
    console.error('getApplicants error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch applicants.' });
  }
}

async function allocateSeats(req, res) {
  try {
    const { internshipId } = req.body;

    const internRes = await query('SELECT * FROM internships WHERE id = $1', [internshipId]);
    if (internRes.length === 0) return res.status(404).json({ success: false, error: 'Internship not found.' });
    const internship = internRes[0];

    const rawApplicants = await query(
      `SELECT a.id as applicationId, a.student_id as studentId, s.full_name as studentName, s.cgpa, a.match_score as matchScore
       FROM applications a
       JOIN students s ON a.student_id = s.id
       WHERE a.internship_id = $1`,
      [internshipId]
    );

    const candidateRanks = rawApplicants.map(c => ({
      applicationId: c.applicationId,
      studentId: c.studentId,
      studentName: c.studentName,
      cgpa: parseFloat(c.cgpa),
      matchScore: parseInt(c.matchScore, 10),
      isEligible: parseFloat(c.cgpa) >= parseFloat(internship.min_cgpa)
    }));

    const result = await dsaService.allocateSeats(internship.available_seats, candidateRanks);

    // Apply allocated statuses to DB
    for (const alloc of result.allocations) {
      if (alloc.isAllocated) {
        await query("UPDATE applications SET status = 'SELECTED', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [alloc.applicationId]);
      }
    }

    return res.json({ success: true, result });
  } catch (error) {
    console.error('allocateSeats error:', error);
    return res.status(500).json({ success: false, error: 'Seat allocation failed.' });
  }
}

module.exports = { getCompanyDashboard, getApplicants, allocateSeats };
