# InternHub Architecture & System Design Document

## 1. System Overview

**InternHub** ("Smart Internship Discovery, Matching & Management") is a production-grade, full-stack enterprise portal connecting Students, Companies, and College Administrators. 

It features:
1. **React JavaScript Frontend (Vite)** with dynamic CSS theme customizer (Dark/Light/System + 6 Accents).
2. **Node.js Express REST API Backend** with JWT Authentication and Role-Based Access Control (RBAC).
3. **PostgreSQL Relational Database** with normalized schemas, indexes, and an embedded SQLite auto-fallback.
4. **Native C++17 DSA Microservice Engine** implementing custom HashMaps, Priority Queues (Max Heap), Skill Relationship Graphs (BFS/DFS), MergeSort/QuickSort, and Greedy Seat Allocators.
5. **AI Service Abstraction** supporting configurable Gemini/OpenAI providers with transparent rule-based fallbacks.

---

## 2. High-Level Architecture Diagram

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
                                           │
                                           ▼
                                    - O(1) HashMap Indexing
                                    - Max Heap Ranking
                                    - Skill Graph BFS/DFS
                                    - Greedy Seat Allocation

AI Integration:

React UI
  ↓
Node.js Backend API
  ↓
AI Service Abstraction
  ↓
External AI Provider (Gemini / OpenAI API) OR Local Rule-Based Fallback
```

---

## 3. Core Subsystems

### Frontend Architecture
- **Framework**: React 19 (JavaScript ONLY - `.js`, `.jsx`).
- **Styling**: Tailwind CSS + CSS Variables for Light/Dark/System modes and 6 Accent Themes (`blue`, `cyan`, `purple`, `green`, `orange`, `red`).
- **Routing**: React Router DOM with protected route guards by user role (`STUDENT`, `COMPANY`, `ADMIN`).
- **Icons & Charts**: Lucide React + Recharts.

### Backend Architecture
- **Runtime**: Node.js v24.
- **Framework**: Express.js REST API.
- **Security**: JWT Authentication, bcrypt password hashing, input validation.
- **Database Driver**: `pg` (PostgreSQL) with SQLite auto-fallback helper (`internhub.sqlite`).

### C++ DSA Engine Architecture
- **Language**: C++17 compiled via `g++` (`dsa_engine.exe`).
- **Communication**: Runs an embedded HTTP server on `http://localhost:7000` or JSON CLI commands.
- **Data Structures**:
  - `CustomHashMap<K, V>`: O(1) average lookup for student skills & internships.
  - `SkillGraph`: Adjacency list representation with Breadth-First Search (BFS) and Depth-First Search (DFS).
  - `CustomPriorityQueue<T, Comp>`: Max Binary Heap for candidate ranking.
  - `AlgorithmsSort`: Custom MergeSort and QuickSort.
  - `MatchingEngine`: 6-factor score calculator (Skill = 40%, CGPA = 20%, Domain = 15%, Location = 10%, Stipend = 10%, WorkMode = 5%).
  - `SeatAllocator`: Greedy seat allocation preventing over-allocation.
