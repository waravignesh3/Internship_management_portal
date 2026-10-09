const { query } = require('../config/db');
const dsaService = require('../services/dsaService');

async function getInternships(req, res) {
  try {
    const { search, domain, workMode, minStipend, maxCgpa, skill, sortBy = 'newest', page = 1, limit = 10 } = req.query;

    let sql = `
      SELECT i.*, c.company_name, c.logo_url, c.location as company_location
      FROM internships i
      JOIN companies c ON i.company_id = c.id
      WHERE i.is_published = 1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (i.title LIKE $${params.length} OR c.company_name LIKE $${params.length} OR i.domain LIKE $${params.length} OR i.location LIKE $${params.length})`;
    }

    if (domain) {
      params.push(`%${domain}%`);
      sql += ` AND i.domain LIKE $${params.length}`;
    }

    if (workMode && workMode !== 'ANY') {
      params.push(workMode);
      sql += ` AND i.work_mode = $${params.length}`;
    }

    if (minStipend) {
      params.push(parseInt(minStipend, 10));
      sql += ` AND i.stipend_monthly >= $${params.length}`;
    }

    if (maxCgpa) {
      params.push(parseFloat(maxCgpa));
      sql += ` AND i.min_cgpa <= $${params.length}`;
    }

    // Sort options
    if (sortBy === 'stipend_desc') {
      sql += ` ORDER BY i.stipend_monthly DESC`;
    } else if (sortBy === 'deadline_asc') {
      sql += ` ORDER BY i.application_deadline ASC`;
    } else {
      sql += ` ORDER BY i.created_at DESC`;
    }

    const items = await query(sql, params);

    // Attach skills to each internship
    for (const item of items) {
      const skills = await query(
        `SELECT sk.name FROM internship_skills isk JOIN skills sk ON isk.skill_id = sk.id WHERE isk.internship_id = $1`,
        [item.id]
      );
      item.required_skills = skills.map(s => s.name);
    }

    return res.json({
      success: true,
      total: items.length,
      page: parseInt(page, 10),
      internships: items
    });
  } catch (error) {
    console.error('getInternships error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch internships.' });
  }
}

async function getInternshipById(req, res) {
  try {
    const { id } = req.params;

    const items = await query(
      `SELECT i.*, c.company_name, c.logo_url, c.website, c.description as company_description, c.location as company_location
       FROM internships i
       JOIN companies c ON i.company_id = c.id
       WHERE i.id = $1`,
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, error: 'Internship not found.' });
    }

    const internship = items[0];

    const skills = await query(
      `SELECT sk.name FROM internship_skills isk JOIN skills sk ON isk.skill_id = sk.id WHERE isk.internship_id = $1`,
      [internship.id]
    );
    internship.required_skills = skills.map(s => s.name);

    return res.json({
      success: true,
      internship
    });
  } catch (error) {
    console.error('getInternshipById error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch internship details.' });
  }
}

async function createInternship(req, res) {
  try {
    const { title, domain, description, responsibilities, work_mode, location, stipend_monthly, duration_months, min_cgpa, available_seats, application_deadline, required_skills } = req.body;

    const companyRes = await query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
    if (companyRes.length === 0) {
      return res.status(403).json({ success: false, error: 'Company profile not found.' });
    }
    const companyId = companyRes[0].id;

    const resInsert = await query(
      `INSERT INTO internships (company_id, title, domain, description, responsibilities, work_mode, location, stipend_monthly, duration_months, min_cgpa, available_seats, application_deadline, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1) RETURNING id`,
      [companyId, title, domain, description, responsibilities || '', work_mode || 'HYBRID', location, stipend_monthly || 0, duration_months || 3, min_cgpa || 0, available_seats || 1, application_deadline]
    );
    const internshipId = resInsert[0].id;

    // Attach skills
    if (Array.isArray(required_skills)) {
      for (const skName of required_skills) {
        let skRes = await query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [skName.trim()]);
        let skillId;
        if (skRes.length === 0) {
          const newSk = await query('INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING id', [skName.trim(), 'PROGRAMMING']);
          skillId = newSk[0].id;
        } else {
          skillId = skRes[0].id;
        }

        await query('INSERT INTO internship_skills (internship_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [internshipId, skillId]);
      }
    }

    return res.status(201).json({ success: true, internshipId, message: 'Internship published successfully.' });
  } catch (error) {
    console.error('createInternship error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create internship.' });
  }
}

async function updateInternship(req, res) {
  try {
    const { id } = req.params;
    const { title, domain, description, work_mode, location, stipend_monthly, available_seats, is_published } = req.body;

    await query(
      `UPDATE internships SET title = $1, domain = $2, description = $3, work_mode = $4, location = $5, stipend_monthly = $6, available_seats = $7, is_published = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9`,
      [title, domain, description, work_mode, location, stipend_monthly, available_seats, is_published ? 1 : 0, id]
    );

    return res.json({ success: true, message: 'Internship updated successfully.' });
  } catch (error) {
    console.error('updateInternship error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update internship.' });
  }
}

async function deleteInternship(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM internships WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Internship deleted successfully.' });
  } catch (error) {
    console.error('deleteInternship error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete internship.' });
  }
}

module.exports = {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship
};
