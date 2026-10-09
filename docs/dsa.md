# C++ Data Structures & Algorithms Engine Specification

## Overview

The C++ DSA Engine (`dsa-engine/`) is a core feature of InternHub. It implements real, non-trivial algorithm structures in C++17 to power recommendation ranking, candidate evaluation, and seat allocation.

---

## 1. Custom HashMap (`include/HashMap.hpp`)
- **Structure**: Separate chaining collision resolution table with vector buckets and automatic rehashing when load factor > 0.75.
- **Operations**: `insert()`, `get()`, `contains()`, `remove()`.
- **Complexity**: Average **O(1)** lookup, **O(N)** worst-case.
- **Use Case**: Fast index retrieval of Student, Skill, and Internship objects.

---

## 2. Skill Relationship Graph (`include/Graph.hpp`)
- **Structure**: Adjacency list representation of skill dependencies (e.g. C++ → DSA → System Design → Microservices).
- **Algorithms**:
  - **BFS (Breadth-First Search)**: Explores related skills within $K$ hops to suggest alternative job categories.
  - **DFS (Depth-First Search)**: Traverses prerequisite chains to construct learning roadmaps.
- **Complexity**: **O(V + E)** time, **O(V)** space.

---

## 3. Priority Queue / Max Binary Heap (`include/PriorityQueue.hpp`)
- **Structure**: Max Binary Heap stored in a contiguous dynamic array.
- **Operations**: `push()` with `heapifyUp`, `pop()` with `heapifyDown`, `top()`.
- **Complexity**: **O(N log N)** overall sorting/ranking, **O(log N)** insertion.
- **Use Case**: Ranks internship recommendations and candidate applications by match score.

---

## 4. Matching & Scoring Engine (`include/MatchingEngine.hpp`)
Multi-factor weighted scoring formula:
$$ \text{Score} = w_{\text{skill}} \cdot S_{\text{skill}} + w_{\text{cgpa}} \cdot S_{\text{cgpa}} + w_{\text{domain}} \cdot S_{\text{domain}} + w_{\text{location}} \cdot S_{\text{location}} + w_{\text{stipend}} \cdot S_{\text{stipend}} + w_{\text{mode}} \cdot S_{\text{mode}} $$

Where:
- Skill Match Weight = **40%**
- CGPA Eligibility = **20%**
- Domain Alignment = **15%**
- Location Preference = **10%**
- Stipend Satisfaction = **10%**
- Work Mode Match = **5%**

---

## 5. Greedy Seat Allocator (`include/SeatAllocator.hpp`)
- **Algorithm**:
  1. Extract candidates into Max Heap.
  2. Filter candidates by CGPA minimum threshold.
  3. Pop candidates in descending rank order.
  4. Allocate available company seats ($K$) and assign `SELECTED` status.
  5. Mark remaining qualified candidates as `WAITLISTED`.
- **Complexity**: **O(K log K)** time.
