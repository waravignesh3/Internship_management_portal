const { query } = require('../config/db');

async function getProgress(req, res) {
  try {
    const sRes = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (sRes.length === 0) return res.json({ success: true, progress: [] });

    const records = await query(
      `SELECT ip.*, i.title as internship_title, c.company_name
       FROM internship_progress ip
       JOIN applications a ON ip.application_id = a.id
       JOIN internships i ON a.internship_id = i.id
       JOIN companies c ON i.company_id = c.id
       WHERE ip.student_id = $1 ORDER BY ip.week_number ASC`,
      [sRes[0].id]
    );

    for (const rec of records) {
      const fb = await query('SELECT * FROM mentor_feedback WHERE progress_id = $1', [rec.id]);
      rec.mentor_feedback = fb[0] || null;
    }

    return res.json({ success: true, progress: records });
  } catch (error) {
    console.error('getProgress error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch internship progress.' });
  }
}

async function submitProgress(req, res) {
  try {
    const { applicationId, weekNumber, tasksCompleted, learningOutcomes, attendancePercentage, studentNotes } = req.body;

    const sRes = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (sRes.length === 0) return res.status(403).json({ success: false, error: 'Student profile required.' });
    const studentId = sRes[0].id;

    const pRes = await query(
      `INSERT INTO internship_progress (application_id, student_id, week_number, progress_status, tasks_completed, learning_outcomes, attendance_percentage, student_notes)
       VALUES ($1, $2, $3, 'COMPLETED', $4, $5, $6, $7) RETURNING id`,
      [applicationId, studentId, weekNumber || 1, tasksCompleted, learningOutcomes, attendancePercentage || 100, studentNotes || '']
    );

    return res.status(201).json({ success: true, progressId: pRes[0].id, message: 'Weekly progress submitted successfully.' });
  } catch (error) {
    console.error('submitProgress error:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit progress.' });
  }
}

module.exports = { getProgress, submitProgress };
