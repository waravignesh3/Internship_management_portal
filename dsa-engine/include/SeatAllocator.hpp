#ifndef SEATALLOCATOR_HPP
#define SEATALLOCATOR_HPP

#include <vector>
#include <string>
#include <algorithm>
#include "Sorting.hpp"
#include "PriorityQueue.hpp"

struct CandidateRank {
    int applicationId;
    int studentId;
    std::string studentName;
    double cgpa;
    int matchScore;
    bool isEligible;
    bool isAllocated;
    std::string allocationReason;
};

struct CandidateComparator {
    bool operator()(const CandidateRank& a, const CandidateRank& b) const {
        if (a.isEligible != b.isEligible) return a.isEligible > b.isEligible;
        if (a.matchScore != b.matchScore) return a.matchScore > b.matchScore;
        return a.cgpa > b.cgpa;
    }
};

class SeatAllocator {
public:
    static std::vector<CandidateRank> allocateSeatsGreedy(int totalSeats, std::vector<CandidateRank> candidates) {
        // Priority Queue / Heap candidate ranking
        CustomPriorityQueue<CandidateRank, CandidateComparator> pq;

        for (auto& candidate : candidates) {
            pq.push(candidate);
        }

        std::vector<CandidateRank> result;
        int seatsRemaining = totalSeats;

        while (!pq.empty()) {
            CandidateRank candidate = pq.top();
            pq.pop();

            if (candidate.isEligible && seatsRemaining > 0) {
                candidate.isAllocated = true;
                candidate.allocationReason = "Allocated seat based on top rank (Score: " + 
                                               std::to_string(candidate.matchScore) + "%, CGPA: " + 
                                               std::to_string(candidate.cgpa).substr(0,4) + ")";
                seatsRemaining--;
            } else if (!candidate.isEligible) {
                candidate.isAllocated = false;
                candidate.allocationReason = "Not allocated: Ineligible due to CGPA requirement";
            } else {
                candidate.isAllocated = false;
                candidate.allocationReason = "Waitlisted: All " + std::to_string(totalSeats) + " seats allocated to higher-ranked candidates";
            }

            result.push_back(candidate);
        }

        return result;
    }
};

#endif
