# InternHub 🚀
> **Tagline:** "Smart Internship Discovery, Matching & Management"

InternHub is a production-grade, full-stack Internship Management Portal connecting **Students**, **Companies**, and **College Administrators**.

The platform combines **React + JavaScript**, **Node.js Express**, **PostgreSQL**, a **Native C++17 DSA Microservice Engine**, and **AI Career Assistance** with zero-downtime rule-based fallbacks.

---

## 🌟 Key Differentiating Features

1. **C++ DSA Matching Engine**:
   - Custom **HashMap** for $O(1)$ skill & internship indexing.
   - **Priority Queue / Max Binary Heap** for candidate match score ranking ($O(N \log N)$).
   - **Skill Relationship Graph** with **BFS** (2-hop related skills) and **DFS** (learning roadmap creation).
   - **Greedy Seat Allocation** algorithm preventing over-allocation ($O(K \log K)$).
2. **AI-Powered Career Suite** (with fallback):
   - **InternHub AI Chatbot** (Floating & Dedicated page with suggested prompts).
   - **Skill Gap Analyzer** (Identifies possessed vs missing skills & priority roadmap).
   - **Resume Tailoring Assistant** (Optimizes resume bullets for target internships).
   - **Interview Prep & Mock Simulator** (Generates questions & evaluates student answers).
   - **Career Advisor** (Generates multi-phase career roadmaps).
3. **Advanced Student & Recruiter System**:
   - **Visual Application Lifecycle Timeline** (`APPLIED` → `UNDER_REVIEW` → `SHORTLISTED` → `INTERVIEW` → `SELECTED`).
   - **Internship Comparison Matrix** (Compare up to 3 internships side-by-side).
   - **Weekly Progress Tracker** (Student task logs & Mentor 1-5 star evaluations).
   - **At-Risk Student Detection** (Automated administrative alerts for unplaced students).
4. **Theme & Customization System**:
   - Light Mode, Dark Mode, System Mode.
   - 6 Color Accent Themes (`blue`, `cyan`, `purple`, `green`, `orange`, `red`) via CSS variables.

---

## 🏗️ Architecture & Technology Stack

```
                    ┌────────────────────────┐
                    │      React UI          │
                    │   (Vite + JavaScript)  │
                    └───────────┬────────────┘
                                │
                                │ REST API (JWT Auth)
                                ▼
                    ┌────────────────────────┐
                    │    Node.js + Express   │
                    │      Backend API       │
                    └───────┬────────┬───────┘
                            │        │
                    PostgreSQL       │ HTTP / CLI
                            │        │
                            ▼        ▼
                    ┌──────────┐  ┌───────────────────┐
                    │PostgreSQL│  │  C++ DSA Engine   │
                    │ Database │  │(Port 7000 / Native)│
                    └──────────┘  └───────────────────┘
```

- **Frontend**: React 19, JavaScript (Vite), React Router DOM, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express.js, JWT Authentication, bcrypt, `pg` (PostgreSQL driver with SQLite auto-fallback).
- **Database**: PostgreSQL (`database/schema.sql`, `database/seed.sql`).
- **DSA Engine**: C++17 (`dsa-engine/`) compiled via GCC / MSVC (`g++ -std=c++17 src/main.cpp -lws2_32 -o dsa_engine.exe`).
- **AI**: Configurable backend abstraction layer (`AI_PROVIDER=gemini`).

---

## 🔑 Quick Demo Credentials

For development and evaluation, use these pre-seeded demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@internhub.local` | `Password123!` |
| **Company** | `company@internhub.local` | `Password123!` |
| **Admin** | `admin@internhub.local` | `Password123!` |

---

## 💻 Quick Start Guide (Windows / Linux / macOS)

### Prerequisites
- **Node.js**: v18+ (`node -v`)
- **C++ Compiler**: GCC `g++` (C++17+) or MSVC

---

### Step 1: Start Backend API & Database

```bash
cd backend
npm install
npm start
```
*Note: The backend automatically initializes tables and seeds realistic demo data on startup!*

The backend runs at `http://localhost:5000`.

---

### Step 2: Build & Run C++ DSA Engine (Optional Microservice)

```bash
cd dsa-engine
g++ -std=c++17 -Iinclude src/main.cpp -lws2_32 -o dsa_engine.exe
.\dsa_engine.exe
```
*Note: If `dsa_engine.exe` is not running, the Node.js backend seamlessly executes the native C++ algorithm mirror in JS!*

---

### Step 3: Start Frontend App

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser!

---

## 📁 Repository Structure

```
InternHub/
├── frontend/             # React Vite JavaScript application
├── backend/              # Node.js Express REST API server
├── dsa-engine/           # C++17 DSA matching microservice
├── database/             # PostgreSQL schema & seed scripts
├── docs/                 # Architecture, Database, DSA, AI, and API docs
├── README.md             # Project documentation
└── .gitignore            # Git ignore file
```

---

## 📜 License & Author

**InternHub Platform** — Built with passion for intelligent internship discovery and career growth.
