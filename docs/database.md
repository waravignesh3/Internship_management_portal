# InternHub Database Architecture

## 1. Schema Specifications

The database layer is written in standard ANSI SQL for PostgreSQL (`database/schema.sql`).

### Core Entities:
1. `users`: Stores user credentials (`email`, `password_hash`), global `role` (`STUDENT`, `COMPANY`, `ADMIN`), and account active status.
2. `students`: Extended student profile (`full_name`, `college_name`, `department`, `cgpa`, `graduation_year`, `preferred_domain`, `resume_url`, `profile_completion`).
3. `companies`: Company profile (`company_name`, `logo_url`, `website`, `industry`, `location`, `company_size`).
4. `skills`: Master list of technical skills categorized by `PROGRAMMING`, `FRAMEWORK`, `DATABASE`, `DEVOPS`, `CORE_CS`.
5. `student_skills`: Junction table relating students to skills with `proficiency_level`.
6. `internships`: Posted internships with stipend, duration, minimum CGPA eligibility, available seats, and deadline.
7. `internship_skills`: Required skills for each internship listing.
8. `applications`: Candidate applications with `status` (`APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`) and calculated DSA `match_score`.
9. `application_status_history`: Audit log tracking every status transition.
10. `bookmarks`: Saved internships per student.
11. `interviews`: Scheduled technical/HR interviews.
12. `internship_progress`: Weekly task logs submitted by selected interns.
13. `mentor_feedback`: Company mentor 1-5 star ratings and reviews.
14. `notifications`: Real-time user notification logs.
15. `activity_logs`: Administrative activity audit trail.

---

## 2. Seed Data (`database/seed.sql`)

Includes:
- **30 Students** with realistic CGPA, skills, and projects.
- **10 Companies** (Google, Microsoft, Zoho, TCS, Infosys, Wipro, Accenture, Freshworks, Cognizant, HCLTech).
- **25 Internships** across diverse tech domains.
- **100 Applications** in various stages.
- **15 Selected Interns** & **10 Scheduled Interviews**.
- **Demo Credentials**:
  - Admin: `admin@internhub.local` / `Password123!`
  - Student: `student@internhub.local` / `Password123!`
  - Company: `company@internhub.local` / `Password123!`
