const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let pgPool = null;
let sqliteDb = null;
let isPostgres = false;

// Initialize Database connection
async function initDb() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/internhub';
  
  try {
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
    });
    
    // Quick test query
    const res = await pool.query('SELECT NOW()');
    console.log('[Database] Connected to PostgreSQL at', res.rows[0].now);
    pgPool = pool;
    isPostgres = true;
    return;
  } catch (err) {
    console.warn('[Database] PostgreSQL connection failed. Falling back to embedded SQLite driver for seamless operation:', err.message);
  }

  // Fallback to SQLite db file
  const dbPath = path.join(__dirname, '../../internhub.sqlite');
  sqliteDb = new sqlite3.Database(dbPath);
  isPostgres = false;

  console.log('[Database] Using SQLite fallback DB at', dbPath);
  await runSqliteSchema();
}

// Unified query wrapper for PG ($1, $2) and SQLite (?, ?)
async function query(text, params = []) {
  if (isPostgres && pgPool) {
    const res = await pgPool.query(text, params);
    return res.rows;
  } else {
    return new Promise((resolve, reject) => {
      // Convert $1, $2 syntax to ? for SQLite
      let sqliteText = text.replace(/\$(\d+)/g, '?');

      if (sqliteText.trim().toUpperCase().startsWith('SELECT') || sqliteText.trim().toUpperCase().includes('RETURNING')) {
        // SQLite doesn't directly support RETURNING in standard syntax for all versions, handle INSERT...RETURNING
        if (sqliteText.toUpperCase().includes('RETURNING')) {
          sqliteText = sqliteText.split(/RETURNING/i)[0];
          sqliteDb.run(sqliteText, params, function(err) {
            if (err) return reject(err);
            resolve([{ id: this.lastID }]);
          });
          return;
        }

        sqliteDb.all(sqliteText, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      } else {
        sqliteDb.run(sqliteText, params, function(err) {
          if (err) return reject(err);
          resolve([{ id: this.lastID, changes: this.changes }]);
        });
      }
    });
  }
}

// Initialize SQLite schema if PG is unavailable
function runSqliteSchema() {
  return new Promise((resolve, reject) => {
    sqliteDb.serialize(() => {
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          is_approved INTEGER DEFAULT 1,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          avatar TEXT,
          phone TEXT,
          college_name TEXT,
          department TEXT,
          cgpa REAL,
          graduation_year INTEGER,
          preferred_domain TEXT,
          preferred_locations TEXT,
          preferred_work_mode TEXT DEFAULT 'ANY',
          min_stipend INTEGER DEFAULT 0,
          bio TEXT,
          resume_url TEXT,
          profile_completion INTEGER DEFAULT 50,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS companies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          company_name TEXT NOT NULL,
          logo_url TEXT,
          website TEXT,
          industry TEXT,
          location TEXT,
          company_size TEXT,
          description TEXT,
          is_verified INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          category TEXT DEFAULT 'OTHER'
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS student_skills (
          student_id INTEGER NOT NULL,
          skill_id INTEGER NOT NULL,
          proficiency_level TEXT DEFAULT 'INTERMEDIATE',
          PRIMARY KEY (student_id, skill_id)
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS internships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          domain TEXT NOT NULL,
          description TEXT NOT NULL,
          responsibilities TEXT,
          work_mode TEXT DEFAULT 'HYBRID',
          location TEXT NOT NULL,
          stipend_monthly INTEGER DEFAULT 0,
          duration_months INTEGER DEFAULT 3,
          min_cgpa REAL DEFAULT 0.00,
          available_seats INTEGER DEFAULT 1,
          application_deadline DATETIME NOT NULL,
          is_published INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS internship_skills (
          internship_id INTEGER NOT NULL,
          skill_id INTEGER NOT NULL,
          is_required INTEGER DEFAULT 1,
          PRIMARY KEY (internship_id, skill_id)
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          internship_id INTEGER NOT NULL,
          status TEXT DEFAULT 'APPLIED',
          match_score INTEGER DEFAULT 0,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(student_id, internship_id)
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS application_status_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          application_id INTEGER NOT NULL,
          status TEXT NOT NULL,
          note TEXT,
          changed_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS bookmarks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          internship_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(student_id, internship_id)
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS interviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          application_id INTEGER NOT NULL,
          internship_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          company_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          scheduled_at DATETIME NOT NULL,
          duration_minutes INTEGER DEFAULT 45,
          interview_type TEXT DEFAULT 'TECHNICAL',
          location_or_link TEXT,
          interviewer_name TEXT,
          notes TEXT,
          status TEXT DEFAULT 'SCHEDULED',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS internship_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          application_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          week_number INTEGER NOT NULL,
          progress_status TEXT DEFAULT 'IN_PROGRESS',
          tasks_completed TEXT,
          learning_outcomes TEXT,
          attendance_percentage INTEGER DEFAULT 100,
          student_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS mentor_feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          progress_id INTEGER NOT NULL,
          mentor_name TEXT NOT NULL,
          rating INTEGER DEFAULT 5,
          feedback_text TEXT,
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT DEFAULT 'INFO',
          is_read INTEGER DEFAULT 0,
          link_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          technologies_used TEXT,
          github_url TEXT,
          live_demo_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS certifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          issuing_organization TEXT,
          issue_date TEXT,
          credential_url TEXT
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS education (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          institution TEXT NOT NULL,
          degree TEXT,
          field_of_study TEXT,
          start_year INTEGER,
          end_year INTEGER,
          grade TEXT
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          details TEXT,
          ip_address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS ai_conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT DEFAULT 'New Conversation',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS ai_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          sender TEXT NOT NULL,
          content TEXT NOT NULL,
          tokens_used INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

module.exports = {
  initDb,
  query,
  getIsPostgres: () => isPostgres
};
