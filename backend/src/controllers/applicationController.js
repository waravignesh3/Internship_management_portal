const { query } = require('../config/db');
const dsaService = require('../services/dsaService');

async function applyToInternship(req, res) {
  try {
    const { internshipId } = req.body;

    const studentRes = await query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    if (studentRes.length === 0) {
      return res.status(403).json({ success: false, error: 'Student profile required to apply.' });
    }
    const student = studentRes[0];

    const internRes = await query('SELECT * FROM internships WHERE id = $1', [internshipId]);
    if (internRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Internship not found.' });
    }
    const internship = internRes[0];

    // Check application deadline
    if (new Date(internship.application_deadline) < new Date()) {
      return res.status(400).json({ success: false, error: 'Application deadline has passed.' });
    }

    // Check CGPA eligibility
    if (parseFloat(student.cgpa) < parseFloat(internship.min_cgpa)) {
      return res.status(400).json({
        success: false,
        error: `Ineligible: Your CGPA (${student.cgpa}) is below required minimum CGPA (${internship.min_cgpa}).`
      });
    }

    // Check duplicate application
    const existing = await query('SELECT id FROM applications WHERE student_id = $1 AND internship_id = $2', [student.id, internshipId]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'You have already applied for this internship.' });
    }

    // Calculate match score using DSA Service
    const studentSkillsRes = await query(
      `SELECT sk.name FROM student_skills ss JOIN skills sk ON ss.skill_id = sk.id WHERE ss.student_id = $1`,
      [student.id]
    );
    student.skills = studentSkillsRes.map(s => s.name);

    const internSkillsRes = await query(
      `SELECT sk.name FROM internship_skills isk JOIN skills sk ON isk.skill_id = sk.id WHERE isk.internship_id = $1`,
      [internshipId]
    );
    internship.required_skills = internSkillsRes.map(s => s.name);

    const matchRes = await dsaService.matchInternships(student, [internship]);
    const score = matchRes.results?.[0]?.matchScore || 75;

    const appInsert = await query(
      `INSERT INTO applications (student_id, internship_id, status, match_score)
       VALUES ($1, $2, 'APPLIED', $3) RETURNING id`,
      [student.id, internshipId, score]
    );
    const appId = appInsert[0].id;

    // Log status history
    await query(
      `INSERT INTO application_status_history (application_id, status, note, changed_by)
       VALUES ($1, 'APPLIED', 'Application submitted by candidate.', 'Student')`,
      [appId]
    );

    // Notify student
    await query(
      `INSERT INTO notifications (user_id, title, message, type, link_url)
       VALUES ($1, 'Application Submitted', $2, 'SUCCESS', '/applications')`,
      [req.user.id, `You successfully applied for ${internship.title}.`]
    );

    return res.status(201).json({
      success: true,
      applicationId: appId,
      matchScore: score,
      message: 'Application submitted successfully!'
    });
  } catch (error) {
    console.error('applyToInternship error:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit application.' });
  }
}

async function getMyApplications(req, res) {
  try {
    const studentRes = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentRes.length === 0) {
      return res.json({ success: true, applications: [] });
    }
    const studentId = studentRes[0].id;

    const apps = await query(
      `SELECT a.*, i.title, i.domain, i.location, i.stipend_monthly, i.work_mode, c.company_name, c.logo_url
       FROM applications a
       JOIN internships i ON a.internship_id = i.id
       JOIN companies c ON i.company_id = c.id
       WHERE a.student_id = $1
       ORDER BY a.applied_at DESC`,
      [studentId]
    );

    for (const app of apps) {
      const history = await query(
        `SELECT status, note, changed_by, created_at FROM application_status_history WHERE application_id = $1 ORDER BY created_at ASC`,
        [app.id]
      );
      app.status_history = history;
    }

    return res.json({ success: true, applications: apps });
  } catch (error) {
    console.error('getMyApplications error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch applications.' });
  }
}

async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid application status.' });
    }

    await query(`UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [status, id]);

    await query(
      `INSERT INTO application_status_history (application_id, status, note, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [id, status, note || `Status updated to ${status}`, req.user.role]
    );

    // Notify target student
    const appDetails = await query(
      `SELECT a.student_id, s.user_id, i.title FROM applications a JOIN students s ON a.student_id = s.id JOIN internships i ON a.internship_id = i.id WHERE a.id = $1`,
      [id]
    );
    if (appDetails.length > 0) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, link_url)
         VALUES ($1, $2, $3, 'INFO', '/applications')`,
        [appDetails[0].user_id, `Application Update: ${status}`, `Your application status for ${appDetails[0].title} is now ${status}.`]
      );
    }

    return res.json({ success: true, message: `Application status updated to ${status}.` });
  } catch (error) {
    console.error('updateApplicationStatus error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
}

module.exports = { applyToInternship, getMyApplications, updateApplicationStatus };
