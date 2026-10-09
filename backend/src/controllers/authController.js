const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

async function register(req, res) {
  try {
    const { email, password, role, fullName, companyName, collegeName, department, cgpa } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Email, password, and role are required.' });
    }

    // Check existing user
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userRes = await query(
      `INSERT INTO users (email, password_hash, role, is_approved, is_active)
       VALUES ($1, $2, $3, 1, 1) RETURNING id, email, role`,
      [email.toLowerCase().trim(), passwordHash, role.toUpperCase()]
    );
    const userId = userRes[0].id;

    if (role.toUpperCase() === 'STUDENT') {
      await query(
        `INSERT INTO students (user_id, full_name, college_name, department, cgpa, profile_completion)
         VALUES ($1, $2, $3, $4, $5, 60)`,
        [userId, fullName || 'New Student', collegeName || 'University', department || 'Computer Science', cgpa || 7.5]
      );
    } else if (role.toUpperCase() === 'COMPANY') {
      await query(
        `INSERT INTO companies (user_id, company_name, is_verified)
         VALUES ($1, $2, 1)`,
        [userId, companyName || 'New Enterprise']
      );
    }

    const token = jwt.sign({ id: userId, email, role: role.toUpperCase() }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      token,
      user: { id: userId, email, role: role.toUpperCase() }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required.' });
    }

    const users = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is deactivated. Contact administrator.' });
    }

    let profileData = {};
    if (user.role === 'STUDENT') {
      const s = await query('SELECT * FROM students WHERE user_id = $1', [user.id]);
      if (s.length > 0) profileData = s[0];
    } else if (user.role === 'COMPANY') {
      const c = await query('SELECT * FROM companies WHERE user_id = $1', [user.id]);
      if (c.length > 0) profileData = c[0];
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Log login activity
    await query('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [
      user.id,
      'USER_LOGIN',
      `User ${user.email} logged in successfully as ${user.role}`
    ]);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Server error during login.' });
  }
}

async function getMe(req, res) {
  try {
    const users = await query('SELECT id, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = users[0];
    let profileData = {};
    if (user.role === 'STUDENT') {
      const s = await query('SELECT * FROM students WHERE user_id = $1', [user.id]);
      if (s.length > 0) {
        profileData = s[0];
        // Fetch student skills
        const sks = await query(
          `SELECT sk.id, sk.name, sk.category, ss.proficiency_level 
           FROM student_skills ss 
           JOIN skills sk ON ss.skill_id = sk.id 
           WHERE ss.student_id = $1`,
          [profileData.id]
        );
        profileData.skills = sks;
      }
    } else if (user.role === 'COMPANY') {
      const c = await query('SELECT * FROM companies WHERE user_id = $1', [user.id]);
      if (c.length > 0) profileData = c[0];
    }

    return res.json({
      success: true,
      user: {
        ...user,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, error: 'Server error retrieving profile.' });
  }
}

module.exports = { register, login, getMe };
