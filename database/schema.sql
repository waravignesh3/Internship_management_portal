-- InternHub PostgreSQL Schema Definition
-- Clean & Drop existing tables if re-initialization is needed

DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS mentor_feedback CASCADE;
DROP TABLE IF EXISTS internship_progress CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS application_status_history CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS internship_skills CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS student_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'COMPANY', 'ADMIN')),
    is_approved BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENTS
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    phone VARCHAR(50),
    college_name VARCHAR(255),
    department VARCHAR(100),
    cgpa NUMERIC(3,2) CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    graduation_year INT,
    preferred_domain VARCHAR(100),
    preferred_locations TEXT, -- Comma-separated or JSON string
    preferred_work_mode VARCHAR(20) DEFAULT 'ANY' CHECK (preferred_work_mode IN ('REMOTE', 'HYBRID', 'ON_SITE', 'ANY')),
    min_stipend INT DEFAULT 0,
    bio TEXT,
    resume_url TEXT,
    profile_completion INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. COMPANIES
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    industry VARCHAR(100),
    location VARCHAR(255),
    company_size VARCHAR(50),
    description TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SKILLS
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'OTHER'
);

-- 5. STUDENT_SKILLS
CREATE TABLE student_skills (
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(30) DEFAULT 'INTERMEDIATE',
    PRIMARY KEY (student_id, skill_id)
);

-- 6. INTERNSHIPS
CREATE TABLE internships (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    work_mode VARCHAR(20) DEFAULT 'HYBRID' CHECK (work_mode IN ('REMOTE', 'HYBRID', 'ON_SITE')),
    location VARCHAR(255) NOT NULL,
    stipend_monthly INT NOT NULL DEFAULT 0,
    duration_months INT NOT NULL DEFAULT 3,
    min_cgpa NUMERIC(3,2) DEFAULT 0.00,
    available_seats INT NOT NULL DEFAULT 1,
    application_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. INTERNSHIP_SKILLS
CREATE TABLE internship_skills (
    internship_id INT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (internship_id, skill_id)
);

-- 8. APPLICATIONS
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    internship_id INT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN')),
    match_score INT DEFAULT 0,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_internship UNIQUE (student_id, internship_id)
);

-- 9. APPLICATION_STATUS_HISTORY
CREATE TABLE application_status_history (
    id SERIAL PRIMARY KEY,
    application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    note TEXT,
    changed_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. BOOKMARKS
CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    internship_id INT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_bookmark UNIQUE (student_id, internship_id)
);

-- 11. INTERVIEWS
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    internship_id INT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 45,
    interview_type VARCHAR(30) DEFAULT 'TECHNICAL',
    location_or_link TEXT,
    interviewer_name VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. INTERNSHIP_PROGRESS
CREATE TABLE internship_progress (
    id SERIAL PRIMARY KEY,
    application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    progress_status VARCHAR(30) DEFAULT 'IN_PROGRESS',
    tasks_completed TEXT,
    learning_outcomes TEXT,
    attendance_percentage INT DEFAULT 100,
    student_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_week UNIQUE (student_id, application_id, week_number)
);

-- 13. MENTOR_FEEDBACK
CREATE TABLE mentor_feedback (
    id SERIAL PRIMARY KEY,
    progress_id INT NOT NULL REFERENCES internship_progress(id) ON DELETE CASCADE,
    mentor_name VARCHAR(100) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. NOTIFICATIONS
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. PROJECTS
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technologies_used VARCHAR(255),
    github_url VARCHAR(255),
    live_demo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. CERTIFICATIONS
CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255),
    issue_date DATE,
    credential_url VARCHAR(255)
);

-- 17. EDUCATION
CREATE TABLE education (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(100),
    field_of_study VARCHAR(100),
    start_year INT,
    end_year INT,
    grade VARCHAR(50)
);

-- 18. ACTIVITY_LOGS
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. AI_CONVERSATIONS
CREATE TABLE ai_conversations (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. AI_MESSAGES
CREATE TABLE ai_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('USER', 'ASSISTANT')),
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_internships_company ON internships(company_id);
CREATE INDEX idx_internships_domain ON internships(domain);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_internship ON applications(internship_id);
CREATE INDEX idx_bookmarks_student ON bookmarks(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
