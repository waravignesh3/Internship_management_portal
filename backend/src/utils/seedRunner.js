const bcrypt = require('bcrypt');
const { query } = require('../config/db');

async function runSeed() {
  console.log('[Seed] Checking database seeding...');

  try {
    const existingUsers = await query('SELECT COUNT(*) as count FROM users');
    const count = parseInt(existingUsers[0].count || existingUsers[0].COUNT || 0, 10);

    if (count > 5) {
      console.log(`[Seed] Database already seeded with ${count} users. Skipping.`);
      return;
    }

    console.log('[Seed] Populating database with realistic demo data...');

    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Password123!', salt);

    // 1. Insert Core Demo Accounts
    // Admin
    const adminUser = await query(
      `INSERT INTO users (email, password_hash, role, is_approved, is_active) 
       VALUES ('admin@internhub.local', $1, 'ADMIN', 1, 1) RETURNING id`,
      [demoPasswordHash]
    );
    const adminId = adminUser[0].id;

    // Student
    const studentUser = await query(
      `INSERT INTO users (email, password_hash, role, is_approved, is_active) 
       VALUES ('student@internhub.local', $1, 'STUDENT', 1, 1) RETURNING id`,
      [demoPasswordHash]
    );
    const mainStudentUserId = studentUser[0].id;

    const mainStudent = await query(
      `INSERT INTO students (user_id, full_name, avatar, phone, college_name, department, cgpa, graduation_year, preferred_domain, preferred_locations, preferred_work_mode, min_stipend, bio, resume_url, profile_completion)
       VALUES ($1, 'Aarav Sharma', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '+91 9876543210', 'Indian Institute of Technology, Madras', 'Computer Science & Engineering', 9.15, 2026, 'Software Engineering', 'Bangalore, Chennai, Remote', 'HYBRID', 35000, 'Passionate C++ and Full Stack developer with strong DSA fundamentals. Active open-source contributor and competitive programmer.', 'https://internhub.local/resumes/aarav_resume.pdf', 95) RETURNING id`,
      [mainStudentUserId]
    );
    const mainStudentId = mainStudent[0].id;

    // Company
    const companyUser = await query(
      `INSERT INTO users (email, password_hash, role, is_approved, is_active) 
       VALUES ('company@internhub.local', $1, 'COMPANY', 1, 1) RETURNING id`,
      [demoPasswordHash]
    );
    const mainCompanyUserId = companyUser[0].id;

    const mainCompany = await query(
      `INSERT INTO companies (user_id, company_name, logo_url, website, industry, location, company_size, description, is_verified)
       VALUES ($1, 'Google', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', 'https://google.com', 'Technology / Software', 'Bangalore, India', '10,000+ employees', 'Google is a global technology leader focused on improving the ways people connect with information.', 1) RETURNING id`,
      [mainCompanyUserId]
    );
    const mainCompanyId = mainCompany[0].id;

    // 2. Populate Skills (30 Skills)
    const skillsList = [
      { name: 'C++', category: 'PROGRAMMING' },
      { name: 'DSA', category: 'CORE_CS' },
      { name: 'Python', category: 'PROGRAMMING' },
      { name: 'React', category: 'FRAMEWORK' },
      { name: 'Node.js', category: 'FRAMEWORK' },
      { name: 'Express', category: 'FRAMEWORK' },
      { name: 'PostgreSQL', category: 'DATABASE' },
      { name: 'SQL', category: 'DATABASE' },
      { name: 'Docker', category: 'DEVOPS' },
      { name: 'System Design', category: 'CORE_CS' },
      { name: 'REST API', category: 'CORE_CS' },
      { name: 'JavaScript', category: 'PROGRAMMING' },
      { name: 'HTML', category: 'PROGRAMMING' },
      { name: 'CSS', category: 'PROGRAMMING' },
      { name: 'Git', category: 'DEVOPS' },
      { name: 'Linux', category: 'DEVOPS' },
      { name: 'Java', category: 'PROGRAMMING' },
      { name: 'Machine Learning', category: 'CORE_CS' },
      { name: 'UI/UX', category: 'OTHER' },
      { name: 'Redis', category: 'DATABASE' },
      { name: 'AWS', category: 'DEVOPS' },
      { name: 'Kubernetes', category: 'DEVOPS' },
      { name: 'MongoDB', category: 'DATABASE' },
      { name: 'TypeScript', category: 'PROGRAMMING' },
      { name: 'Microservices', category: 'CORE_CS' },
      { name: 'Security', category: 'CORE_CS' },
      { name: 'GraphQL', category: 'FRAMEWORK' },
      { name: 'Next.js', category: 'FRAMEWORK' },
      { name: 'Django', category: 'FRAMEWORK' },
      { name: 'Flutter', category: 'FRAMEWORK' }
    ];

    const skillIdMap = {};
    for (const sk of skillsList) {
      const res = await query(
        `INSERT INTO skills (name, category) VALUES ($1, $2) RETURNING id`,
        [sk.name, sk.category]
      );
      skillIdMap[sk.name] = res[0].id;
    }

    // Associate main student skills
    const mainSkills = ['C++', 'DSA', 'SQL', 'React', 'Node.js', 'System Design', 'Git'];
    for (const skName of mainSkills) {
      if (skillIdMap[skName]) {
        await query(
          `INSERT INTO student_skills (student_id, skill_id, proficiency_level) VALUES ($1, $2, 'ADVANCED')`,
          [mainStudentId, skillIdMap[skName]]
        );
      }
    }

    // Add main student projects & education
    await query(
      `INSERT INTO projects (student_id, title, description, technologies_used, github_url, live_demo_url)
       VALUES ($1, 'High-Throughput Matching Engine', 'Built an ultra-fast C++ matching engine using Priority Queues and Hash Maps to match student skills against job specifications.', 'C++, Multi-threading, Custom Heap', 'https://github.com/aarav/matching-engine', 'https://demo.internhub.local')`,
      [mainStudentId]
    );

    await query(
      `INSERT INTO education (student_id, institution, degree, field_of_study, start_year, end_year, grade)
       VALUES ($1, 'IIT Madras', 'B.Tech', 'Computer Science & Engineering', 2022, 2026, '9.15 CGPA')`,
      [mainStudentId]
    );

    // 3. Populate 9 Additional Companies (Total 10 Companies)
    const companyNames = [
      { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', industry: 'Software & Cloud', location: 'Hyderabad, India' },
      { name: 'Zoho Corporation', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Zoho_logo.png', industry: 'SaaS Software', location: 'Chennai, India' },
      { name: 'TCS', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/TATA_Consultancy_Services_Logo.svg', industry: 'IT Services', location: 'Mumbai, India' },
      { name: 'Infosys', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg', industry: 'IT Services', location: 'Bangalore, India' },
      { name: 'Wipro', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg', industry: 'IT Consulting', location: 'Bangalore, India' },
      { name: 'Accenture', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg', industry: 'Management Consulting', location: 'Gurgaon, India' },
      { name: 'Freshworks', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Freshworks_Logo.png', industry: 'SaaS Customer Service', location: 'Chennai, India' },
      { name: 'Cognizant', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Cognizant_logo_2022.svg', industry: 'IT Services', location: 'Kochi, India' },
      { name: 'HCLTech', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/df/HCLTech_Logo.svg', industry: 'IT & Engineering', location: 'Noida, India' }
    ];

    const companyIds = [mainCompanyId];
    for (let i = 0; i < companyNames.length; i++) {
      const uRes = await query(
        `INSERT INTO users (email, password_hash, role, is_approved, is_active) 
         VALUES ($1, $2, 'COMPANY', 1, 1) RETURNING id`,
        [`company_${i + 2}@internhub.local`, demoPasswordHash]
      );
      const cRes = await query(
        `INSERT INTO companies (user_id, company_name, logo_url, website, industry, location, company_size, description, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, '5,000+ employees', $7, 1) RETURNING id`,
        [
          uRes[0].id,
          companyNames[i].name,
          companyNames[i].logo,
          `https://${companyNames[i].name.toLowerCase().replace(/\s+/g, '')}.com`,
          companyNames[i].industry,
          companyNames[i].location,
          `${companyNames[i].name} provides world-class internships and career opportunities for young engineers.`
        ]
      );
      companyIds.push(cRes[0].id);
    }

    // 4. Populate 30 Students
    const studentNames = [
      'Priya Patel', 'Rohan Verma', 'Sneha Reddy', 'Vikram Singh', 'Ananya Gupta',
      'Karthik Raja', 'Meera Nair', 'Aditya Joshi', 'Divya Roy', 'Siddharth Malhotra',
      'Tanvi Shah', 'Rahul Deshmukh', 'Pooja Hegde', 'Arjun Kapoor', 'Riya Sen',
      'Nikhil Kumar', 'Shreya Ghoshal', 'Varun Dhawan', 'Kriti Sanon', 'Ayushmann Khurrana',
      'Tara Sutaria', 'Ishaan Khatter', 'Janhvi Kapoor', 'Siddhant Chaturvedi', 'Ananya Panday',
      'Abhimanyu Dassani', 'Radhika Madan', 'Rohit Saraf', 'Sharvari Wagh', 'Ahan Shetty'
    ];

    const studentIds = [mainStudentId];
    for (let i = 0; i < studentNames.length; i++) {
      const uRes = await query(
        `INSERT INTO users (email, password_hash, role, is_approved, is_active) 
         VALUES ($1, $2, 'STUDENT', 1, 1) RETURNING id`,
        [`student_${i + 2}@internhub.local`, demoPasswordHash]
      );
      const randomCgpa = (6.0 + Math.random() * 3.8).toFixed(2);
      const sRes = await query(
        `INSERT INTO students (user_id, full_name, avatar, phone, college_name, department, cgpa, graduation_year, preferred_domain, preferred_locations, preferred_work_mode, min_stipend, bio, resume_url, profile_completion)
         VALUES ($1, $2, $3, $4, 'Anna University / NIT / BITS', 'Computer Science / IT', $5, 2026, 'Software Engineering', 'Bangalore, Remote', 'HYBRID', 25000, 'Passionate engineering student looking to build scalable software.', 'https://internhub.local/resumes/sample.pdf', 85) RETURNING id`,
        [
          uRes[0].id,
          studentNames[i],
          `https://i.pravatar.cc/150?img=${i + 10}`,
          `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
          randomCgpa
        ]
      );
      studentIds.push(sRes[0].id);

      // Assign random skills
      const randomSkillNames = ['C++', 'DSA', 'React', 'Node.js', 'Python', 'SQL', 'Docker', 'System Design'];
      for (const sk of randomSkillNames) {
        if (Math.random() > 0.4 && skillIdMap[sk]) {
          await query(
            `INSERT INTO student_skills (student_id, skill_id, proficiency_level) VALUES ($1, $2, 'INTERMEDIATE')`,
            [sRes[0].id, skillIdMap[sk]]
          );
        }
      }
    }

    // 5. Populate 25 Internships
    const internshipTitles = [
      { title: 'C++ Systems Software Intern', domain: 'Software Engineering', stipend: 45000, seats: 5, reqCgpa: 8.0, reqSkills: ['C++', 'DSA', 'SQL', 'System Design'] },
      { title: 'Full Stack Web Developer Intern', domain: 'Web Development', stipend: 35000, seats: 8, reqCgpa: 7.0, reqSkills: ['React', 'Node.js', 'Express', 'PostgreSQL'] },
      { title: 'Backend Systems & API Intern', domain: 'Backend Development', stipend: 50000, seats: 3, reqCgpa: 7.5, reqSkills: ['C++', 'Node.js', 'Docker', 'SQL'] },
      { title: 'AI & Data Structures Intern', domain: 'Artificial Intelligence', stipend: 40000, seats: 4, reqCgpa: 8.2, reqSkills: ['Python', 'DSA', 'Machine Learning', 'C++'] },
      { title: 'Cloud Infrastructure & DevOps Intern', domain: 'DevOps & Cloud', stipend: 38000, seats: 6, reqCgpa: 7.2, reqSkills: ['Docker', 'Linux', 'AWS', 'Git'] },
      { title: 'Frontend UI/UX Engineer Intern', domain: 'Frontend Development', stipend: 30000, seats: 10, reqCgpa: 6.5, reqSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'UI/UX'] },
      { title: 'Database Optimization & SQL Engineer', domain: 'Database Engineering', stipend: 32000, seats: 4, reqCgpa: 7.0, reqSkills: ['SQL', 'PostgreSQL', 'Redis', 'Database Design'] },
      { title: 'Mobile App Development Intern (Flutter/React Native)', domain: 'Mobile Development', stipend: 28000, seats: 5, reqCgpa: 6.8, reqSkills: ['Flutter', 'JavaScript', 'REST API'] },
      { title: 'Cybersecurity & Application Audit Intern', domain: 'Cybersecurity', stipend: 42000, seats: 2, reqCgpa: 8.0, reqSkills: ['Security', 'Linux', 'C++', 'Python'] },
      { title: 'Microservices & Distributed Systems Intern', domain: 'Software Engineering', stipend: 48000, seats: 3, reqCgpa: 8.5, reqSkills: ['C++', 'Microservices', 'Docker', 'Kubernetes'] }
    ];

    const internshipIds = [];
    const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    for (let i = 0; i < 25; i++) {
      const template = internshipTitles[i % internshipTitles.length];
      const compId = companyIds[i % companyIds.length];

      const res = await query(
        `INSERT INTO internships (company_id, title, domain, description, responsibilities, work_mode, location, stipend_monthly, duration_months, min_cgpa, available_seats, application_deadline, is_published)
         VALUES ($1, $2, $3, $4, $5, 'HYBRID', 'Bangalore / Remote', $6, 6, $7, $8, $9, 1) RETURNING id`,
        [
          compId,
          `${template.title} ${i > 9 ? '#' + (i + 1) : ''}`,
          template.domain,
          `Exciting internship opportunity for ambitious students to work on cutting-edge engineering projects at scale.`,
          `1. Design and build robust code modules.\n2. Participate in daily standups and code reviews.\n3. Write performance benchmarks and tests.`,
          template.stipend + (i * 1000),
          template.reqCgpa,
          template.seats,
          futureDeadline
        ]
      );
      const internId = res[0].id;
      internshipIds.push(internId);

      // Attach required skills
      for (const skName of template.reqSkills) {
        if (skillIdMap[skName]) {
          await query(
            `INSERT INTO internship_skills (internship_id, skill_id, is_required) VALUES ($1, $2, 1)`,
            [internId, skillIdMap[skName]]
          );
        }
      }
    }

    // 6. Populate 100 Applications & Application History
    const statusCycle = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];
    let applicationCount = 0;
    const selectedApplicationIds = [];

    for (const stId of studentIds) {
      // Each student applies to 3-4 internships
      const numApps = 3 + Math.floor(Math.random() * 2);
      for (let j = 0; j < numApps; j++) {
        const internId = internshipIds[(stId * 3 + j) % internshipIds.length];
        const status = statusCycle[applicationCount % statusCycle.length];
        const score = 75 + Math.floor(Math.random() * 23);

        const appRes = await query(
          `INSERT INTO applications (student_id, internship_id, status, match_score)
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT DO NOTHING RETURNING id`,
          [stId, internId, status, score]
        );

        if (appRes && appRes[0]) {
          const appId = appRes[0].id;
          applicationCount++;

          await query(
            `INSERT INTO application_status_history (application_id, status, note, changed_by)
             VALUES ($1, $2, 'Initial status update during evaluation.', 'System')`,
            [appId, status]
          );

          if (status === 'SELECTED') {
            selectedApplicationIds.push({ appId, studentId: stId, internshipId: internId });
          }

          if (status === 'INTERVIEW') {
            await query(
              `INSERT INTO interviews (application_id, internship_id, student_id, company_id, title, scheduled_at, duration_minutes, interview_type, location_or_link, interviewer_name, notes, status)
               VALUES ($1, $2, $3, $4, 'Technical Round 1', $5, 45, 'TECHNICAL', 'https://meet.google.com/abc-defg-hij', 'Senior Engineering Lead', 'Focus on C++, Data Structures, and System Design.', 'SCHEDULED')`,
              [appId, internId, stId, companyIds[0], new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()]
            );
          }
        }
      }
    }

    // 7. Internship Progress Records for Selected Students
    for (const sel of selectedApplicationIds) {
      const pRes = await query(
        `INSERT INTO internship_progress (application_id, student_id, week_number, progress_status, tasks_completed, learning_outcomes, attendance_percentage, student_notes)
         VALUES ($1, $2, 1, 'COMPLETED', 'Configured development setup, implemented initial database migration script, created baseline unit tests.', 'Gained deep understanding of modern enterprise database schemas and C++ matching performance.', 100, 'Great onboarding week with supportive team.') RETURNING id`,
        [sel.appId, sel.studentId]
      );

      await query(
        `INSERT INTO mentor_feedback (progress_id, mentor_name, rating, feedback_text)
         VALUES ($1, 'Dr. Aris Thorne', 5, 'Outstanding initiative, strong algorithm analysis, and clean code submission.')`,
        [pRes[0].id]
      );
    }

    // 8. Notifications
    await query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, link_url)
       VALUES ($1, 'Welcome to InternHub!', 'Your student profile is active. Explore internships matching your C++ and DSA skills.', 'SUCCESS', 0, '/recommendations')`,
      [mainStudentUserId]
    );

    await query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, link_url)
       VALUES ($1, 'Interview Scheduled', 'Google has scheduled your Technical Interview for C++ Systems Software Intern.', 'INFO', 0, '/interviews')`,
      [mainStudentUserId]
    );

    console.log('[Seed] Seeding completed successfully!');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  }
}

module.exports = { runSeed };
