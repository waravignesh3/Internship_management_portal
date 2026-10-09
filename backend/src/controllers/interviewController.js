const { query } = require('../config/db');

async function scheduleInterview(req, res) {
  try {
    const { applicationId, title, scheduledAt, durationMinutes, interviewType, locationOrLink, interviewerName, notes } = req.body;

    const appRes = await query(
      `SELECT a.student_id, a.internship_id, i.company_id, i.title as internship_title, s.user_id as student_user_id
       FROM applications a
       JOIN internships i ON a.internship_id = i.id
       JOIN students s ON a.student_id = s.id
       WHERE a.id = $1`,
      [applicationId]
    );

    if (appRes.length === 0) return res.status(404).json({ success: false, error: 'Application not found.' });
    const app = appRes[0];

    const ivRes = await query(
      `INSERT INTO interviews (application_id, internship_id, student_id, company_id, title, scheduled_at, duration_minutes, interview_type, location_or_link, interviewer_name, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'SCHEDULED') RETURNING id`,
      [
        applicationId,
        app.internship_id,
        app.student_id,
        app.company_id,
        title || 'Technical Interview',
        scheduledAt,
        durationMinutes || 45,
        interviewType || 'TECHNICAL',
        locationOrLink || 'https://meet.google.com/abc-defg-hij',
        interviewerName || 'Senior Engineering Lead',
        notes || ''
      ]
    );

    // Update application status to INTERVIEW
    await query("UPDATE applications SET status = 'INTERVIEW', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [applicationId]);

    // Notify student
    await query(
      `INSERT INTO notifications (user_id, title, message, type, link_url)
       VALUES ($1, 'Interview Scheduled', $2, 'INFO', '/interviews')`,
      [app.student_user_id, `Interview scheduled for ${app.internship_title} on ${new Date(scheduledAt).toLocaleString()}`]
    );

    return res.status(201).json({ success: true, interviewId: ivRes[0].id, message: 'Interview scheduled successfully.' });
  } catch (error) {
    console.error('scheduleInterview error:', error);
    return res.status(500).json({ success: false, error: 'Failed to schedule interview.' });
  }
}

async function getInterviews(req, res) {
  try {
    let interviews = [];

    if (req.user.role === 'STUDENT') {
      const sRes = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (sRes.length > 0) {
        interviews = await query(
          `SELECT iv.*, i.title as internship_title, c.company_name, c.logo_url
           FROM interviews iv
           JOIN internships i ON iv.internship_id = i.id
           JOIN companies c ON iv.company_id = c.id
           WHERE iv.student_id = $1 ORDER BY iv.scheduled_at ASC`,
          [sRes[0].id]
        );
      }
    } else if (req.user.role === 'COMPANY') {
      const cRes = await query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
      if (cRes.length > 0) {
        interviews = await query(
          `SELECT iv.*, i.title as internship_title, s.full_name as student_name, s.cgpa
           FROM interviews iv
           JOIN internships i ON iv.internship_id = i.id
           JOIN students s ON iv.student_id = s.id
           WHERE iv.company_id = $1 ORDER BY iv.scheduled_at ASC`,
          [cRes[0].id]
        );
      }
    } else {
      interviews = await query(
        `SELECT iv.*, i.title as internship_title, c.company_name, s.full_name as student_name
         FROM interviews iv
         JOIN internships i ON iv.internship_id = i.id
         JOIN companies c ON iv.company_id = c.id
         JOIN students s ON iv.student_id = s.id
         ORDER BY iv.scheduled_at ASC`
      );
    }

    return res.json({ success: true, interviews });
  } catch (error) {
    console.error('getInterviews error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch interviews.' });
  }
}

module.exports = { scheduleInterview, getInterviews };
