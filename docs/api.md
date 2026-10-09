# InternHub REST API Specification

Base URL: `http://localhost:5000/api`

## Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register`: Register student or company user.
- `POST /login`: Authenticate and receive JWT token.
- `POST /logout`: Invalidate session.
- `GET /me`: Get authenticated user profile.

### Student (`/api/students`)
- `GET /dashboard`: Fetch student stats, recommendations, deadlines, interviews.
- `PUT /profile`: Update profile skills, CGPA, and resume URL.

### Internships (`/api/internships`)
- `GET /`: Search & filter published internships.
- `GET /:id`: Fetch detailed internship specifications.
- `POST /`: Publish new internship (Company/Admin).
- `PUT /:id`: Edit internship details.
- `DELETE /:id`: Delete internship.

### Applications (`/api/applications`)
- `POST /`: Submit internship application.
- `GET /my`: View student applications & status history timeline.
- `PUT /:id/status`: Update candidate status (`SHORTLISTED`, `SELECTED`, `REJECTED`).

### Bookmarks (`/api/bookmarks`)
- `GET /`: List saved internships.
- `POST /toggle`: Toggle saved state.

### Company (`/api/companies`)
- `GET /dashboard`: Recruiter dashboard metrics.
- `GET /applicants`: List candidate applicants ranked by DSA match score.
- `POST /allocate-seats`: Run C++ Greedy Seat Allocation.

### Interviews (`/api/interviews`)
- `POST /`: Schedule candidate interview.
- `GET /`: List upcoming/past interviews.

### Admin (`/api/admin`)
- `GET /dashboard`: Global statistics & At-Risk student list.
- `GET /analytics`: Recharts data for applications, domains, skills.
- `GET /activity-logs`: System audit trail.
- `PUT /users/:userId/toggle`: Activate/deactivate user accounts.

### DSA Engine (`/api/dsa`)
- `POST /match`: Run C++ matching algorithm.
- `POST /allocate`: Run C++ seat allocation.
- `POST /graph`: Query C++ skill relationship graph.
- `GET /stats`: Fetch algorithm metrics.

### AI Engine (`/api/ai`)
- `POST /chat`: AI Chatbot assistant.
- `POST /skill-gap`: AI Skill Gap analyzer.
- `POST /resume`: AI Resume assistant.
- `POST /career`: AI Career advisor.
- `POST /interview`: AI Interview preparation & mock simulator.
