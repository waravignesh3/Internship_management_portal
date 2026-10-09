const { query } = require('../config/db');
const dsaService = require('../services/dsaService');
const aiService = require('../services/ai/aiService');

async function getStudentDashboard(req, res) {
  try {
    const sRes = await query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    if (sRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }
    const student = sRes[0];

    // Fetch skills
    const skillsRes = await query(
      `SELECT sk.name FROM student_skills ss JOIN skills sk ON ss.skill_id = sk.id WHERE ss.student_id = $1`,
      [student.id]
    );
    student.skills = skillsRes.map(s => s.name);

    // Fetch stats
    const totalApps = await query('SELECT COUNT(*) as cnt FROM applications WHERE student_id = $1', [student.id]);
    const shortlisted = await query("SELECT COUNT(*) as cnt FROM applications WHERE student_id = $1 AND status = 'SHORTLISTED'", [student.id]);
    const selected = await query("SELECT COUNT(*) as cnt FROM applications WHERE student_id = $1 AND status = 'SELECTED'", [student.id]);
    const saved = await query('SELECT COUNT(*) as cnt FROM bookmarks WHERE student_id = $1', [student.id]);

    const totalCount = parseInt(totalApps[0].cnt || totalApps[0].CNT || 0, 10);
    const selectedCount = parseInt(selected[0].cnt || selected[0].CNT || 0, 10);
    const successRate = totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0;

    // Fetch upcoming interviews
    const interviews = await query(
      `SELECT iv.*, i.title as internship_title, c.company_name, c.logo_url
       FROM interviews iv
       JOIN internships i ON iv.internship_id = i.id
       JOIN companies c ON iv.company_id = c.id
       WHERE iv.student_id = $1 AND iv.status = 'SCHEDULED'
       ORDER BY iv.scheduled_at ASC LIMIT 5`,
      [student.id]
    );

    // Fetch recommendations using C++ DSA Service
    const allInternships = await query(
      `SELECT i.*, c.company_name, c.logo_url FROM internships i JOIN companies c ON i.company_id = c.id WHERE i.is_published = 1 LIMIT 15`
    );

    for (const intern of allInternships) {
      const sks = await query(
        `SELECT sk.name FROM internship_skills isk JOIN skills sk ON isk.skill_id = sk.id WHERE isk.internship_id = $1`,
        [intern.id]
      );
      intern.required_skills = sks.map(s => s.name);
    }

    const dsaMatchRes = await dsaService.matchInternships(student, allInternships);

    // Fetch recent applications
    const recentApps = await query(
      `SELECT a.*, i.title, i.domain, c.company_name, c.logo_url
       FROM applications a
       JOIN internships i ON a.internship_id = i.id
       JOIN companies c ON i.company_id = c.id
       WHERE a.student_id = $1 ORDER BY a.applied_at DESC LIMIT 5`,
      [student.id]
    );

    return res.json({
      success: true,
      stats: {
        totalApplications: totalCount,
        shortlisted: parseInt(shortlisted[0].cnt || shortlisted[0].CNT || 0, 10),
        selected: selectedCount,
        savedInternships: parseInt(saved[0].cnt || saved[0].CNT || 0, 10),
        successRate,
        profileCompletion: student.profile_completion || 85
      },
      student,
      upcomingInterviews: interviews,
      recentApplications: recentApps,
      recommendations: dsaMatchRes.results || [],
      dsaMeta: {
        engine: dsaMatchRes.engine,
        algorithm: dsaMatchRes.algorithm,
        timeComplexity: dsaMatchRes.timeComplexity,
        executionTimeMs: dsaMatchRes.executionTimeMs
      }
    });
  } catch (error) {
    console.error('getStudentDashboard error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load student dashboard.' });
  }
}

async function updateStudentProfile(req, res) {
  try {
    const { full_name, phone, college_name, department, cgpa, graduation_year, preferred_domain, preferred_locations, preferred_work_mode, min_stipend, bio, resume_url, skills } = req.body;

    const sRes = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (sRes.length === 0) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }
    const studentId = sRes[0].id;

    let completion = 50;
    if (bio) completion += 10;
    if (resume_url) completion += 15;
    if (cgpa) completion += 10;
    if (skills && skills.length > 0) completion += 15;
    completion = Math.min(100, completion);

    await query(
      `UPDATE students SET full_name = $1, phone = $2, college_name = $3, department = $4, cgpa = $5, graduation_year = $6, preferred_domain = $7, preferred_locations = $8, preferred_work_mode = $9, min_stipend = $10, bio = $11, resume_url = $12, profile_completion = $13, updated_at = CURRENT_TIMESTAMP WHERE id = $14`,
      [full_name, phone, college_name, department, cgpa, graduation_year, preferred_domain, preferred_locations, preferred_work_mode, min_stipend, bio, resume_url, completion, studentId]
    );

    // Update skills
    if (Array.isArray(skills)) {
      await query('DELETE FROM student_skills WHERE student_id = $1', [studentId]);
      for (const skName of skills) {
        let skRes = await query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [skName.trim()]);
        let skillId;
        if (skRes.length === 0) {
          const newSk = await query('INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING id', [skName.trim(), 'PROGRAMMING']);
          skillId = newSk[0].id;
        } else {
          skillId = skRes[0].id;
        }
        await query('INSERT INTO student_skills (student_id, skill_id, proficiency_level) VALUES ($1, $2, $3)', [studentId, skillId, 'INTERMEDIATE']);
      }
    }

    return res.json({ success: true, message: 'Profile updated successfully!', profileCompletion: completion });
  } catch (error) {
    console.error('updateStudentProfile error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
}

module.exports = { getStudentDashboard, updateStudentProfile };
