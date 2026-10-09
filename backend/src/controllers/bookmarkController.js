const { query } = require('../config/db');

async function getBookmarks(req, res) {
  try {
    const sRes = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (sRes.length === 0) return res.json({ success: true, bookmarks: [] });

    const bookmarks = await query(
      `SELECT b.id as bookmark_id, b.created_at as saved_at, i.*, c.company_name, c.logo_url
       FROM bookmarks b
       JOIN internships i ON b.internship_id = i.id
       JOIN companies c ON i.company_id = c.id
       WHERE b.student_id = $1 ORDER BY b.created_at DESC`,
      [sRes[0].id]
    );

    for (const b of bookmarks) {
      const skills = await query(
        `SELECT sk.name FROM internship_skills isk JOIN skills sk ON isk.skill_id = sk.id WHERE isk.internship_id = $1`,
        [b.id]
      );
      b.required_skills = skills.map(s => s.name);
    }

    return res.json({ success: true, bookmarks });
  } catch (error) {
    console.error('getBookmarks error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch bookmarks.' });
  }
}

async function toggleBookmark(req, res) {
  try {
    const { internshipId } = req.body;
    const sRes = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (sRes.length === 0) return res.status(403).json({ success: false, error: 'Student profile required.' });

    const existing = await query('SELECT id FROM bookmarks WHERE student_id = $1 AND internship_id = $2', [sRes[0].id, internshipId]);

    if (existing.length > 0) {
      await query('DELETE FROM bookmarks WHERE id = $1', [existing[0].id]);
      return res.json({ success: true, saved: false, message: 'Removed from bookmarks.' });
    } else {
      await query('INSERT INTO bookmarks (student_id, internship_id) VALUES ($1, $2)', [sRes[0].id, internshipId]);
      return res.json({ success: true, saved: true, message: 'Saved to bookmarks.' });
    }
  } catch (error) {
    console.error('toggleBookmark error:', error);
    return res.status(500).json({ success: false, error: 'Failed to toggle bookmark.' });
  }
}

module.exports = { getBookmarks, toggleBookmark };
