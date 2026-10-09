#ifndef MATCHINGENGINE_HPP
#define MATCHINGENGINE_HPP

#include <string>
#include <vector>
#include <unordered_set>
#include <algorithm>
#include <cmath>
#include "HashMap.hpp"
#include "PriorityQueue.hpp"

struct StudentProfile {
    int studentId;
    std::string fullName;
    double cgpa;
    std::string preferredDomain;
    std::vector<std::string> preferredLocations;
    std::string preferredWorkMode;
    int minStipend;
    std::vector<std::string> skills;
};

struct InternshipData {
    int id;
    std::string title;
    std::string companyName;
    std::string domain;
    double minCgpa;
    std::string location;
    std::string workMode;
    int stipendMonthly;
    int availableSeats;
    std::vector<std::string> requiredSkills;
};

struct MatchResult {
    int internshipId;
    std::string title;
    std::string companyName;
    int matchScore;
    std::vector<std::string> matchedSkills;
    std::vector<std::string> missingSkills;
    bool isEligible;
    std::string explanation;
};

class MatchingEngine {
public:
    static MatchResult calculateMatch(const StudentProfile& student, const InternshipData& internship) {
        MatchResult result;
        result.internshipId = internship.id;
        result.title = internship.title;
        result.companyName = internship.companyName;

        // Check CGPA eligibility
        result.isEligible = (student.cgpa >= internship.minCgpa);

        // 1. Skill match score (40%)
        std::unordered_set<std::string> studentSkillSet;
        for (const auto& s : student.skills) {
            std::string lower = s;
            std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
            studentSkillSet.insert(lower);
        }

        int reqCount = internship.requiredSkills.size();
        int matchedCount = 0;
        for (const auto& req : internship.requiredSkills) {
            std::string lower = req;
            std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
            if (studentSkillSet.find(lower) != studentSkillSet.end()) {
                matchedCount++;
                result.matchedSkills.push_back(req);
            } else {
                result.missingSkills.push_back(req);
            }
        }

        double skillScore = (reqCount > 0) ? ((double)matchedCount / reqCount) * 40.0 : 40.0;

        // 2. CGPA Score (20%)
        double cgpaScore = 0.0;
        if (student.cgpa >= internship.minCgpa) {
            double ratio = student.cgpa / 10.0;
            cgpaScore = ratio * 20.0;
        }

        // 3. Domain Score (15%)
        double domainScore = 0.0;
        std::string sDom = student.preferredDomain;
        std::string iDom = internship.domain;
        std::transform(sDom.begin(), sDom.end(), sDom.begin(), ::tolower);
        std::transform(iDom.begin(), iDom.end(), iDom.begin(), ::tolower);
        if (sDom == iDom || sDom.find(iDom) != std::string::npos || iDom.find(sDom) != std::string::npos) {
            domainScore = 15.0;
        }

        // 4. Location Score (10%)
        double locationScore = 0.0;
        std::string iLoc = internship.location;
        std::transform(iLoc.begin(), iLoc.end(), iLoc.begin(), ::tolower);
        for (const auto& loc : student.preferredLocations) {
            std::string l = loc;
            std::transform(l.begin(), l.end(), l.begin(), ::tolower);
            if (l == iLoc || iLoc.find(l) != std::string::npos || l == "any" || l == "remote") {
                locationScore = 10.0;
                break;
            }
        }

        // 5. Stipend Score (10%)
        double stipendScore = 0.0;
        if (internship.stipendMonthly >= student.minStipend) {
            stipendScore = 10.0;
        } else if (student.minStipend > 0) {
            stipendScore = ((double)internship.stipendMonthly / student.minStipend) * 10.0;
        } else {
            stipendScore = 10.0;
        }

        // 6. Work mode score (5%)
        double workModeScore = 0.0;
        std::string sMode = student.preferredWorkMode;
        std::string iMode = internship.workMode;
        std::transform(sMode.begin(), sMode.end(), sMode.begin(), ::tolower);
        std::transform(iMode.begin(), iMode.end(), iMode.begin(), ::tolower);
        if (sMode == "any" || sMode == iMode) {
            workModeScore = 5.0;
        }

        double totalScore = skillScore + cgpaScore + domainScore + locationScore + stipendScore + workModeScore;
        result.matchScore = (int)std::round(totalScore);

        // Generate transparent explanation
        std::string exp = "Recommended because you match " + std::to_string(matchedCount) + "/" + std::to_string(reqCount) +
                          " required skills (" + std::to_string((int)std::round((skillScore/40.0)*100)) + "%)";
        if (result.isEligible) {
            exp += ", your CGPA (" + std::to_string(student.cgpa).substr(0,4) + ") meets eligibility (" + std::to_string(internship.minCgpa).substr(0,4) + ")";
        }
        if (domainScore > 0) exp += ", preferred domain aligns (" + internship.domain + ")";
        result.explanation = exp;

        return result;
    }
};

#endif
