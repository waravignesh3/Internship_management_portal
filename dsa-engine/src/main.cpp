#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <algorithm>
#include <chrono>
#include <thread>
#include <cstring>
#include <functional>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#define SOCKET int
#define INVALID_SOCKET -1
#define SOCKET_ERROR -1
#define closesocket close
#endif

#include "HashMap.hpp"
#include "Graph.hpp"
#include "PriorityQueue.hpp"
#include "Queue.hpp"
#include "Stack.hpp"
#include "Sorting.hpp"
#include "Searching.hpp"
#include "MatchingEngine.hpp"
#include "SeatAllocator.hpp"

static unsigned long long totalMatchesRun = 0;
static unsigned long long totalAllocationsRun = 0;
static unsigned long long totalGraphSearchesRun = 0;

// Helper function to extract JSON string fields easily without full heavyweight parser dependencies
std::string getJsonField(const std::string& json, const std::string& key) {
    std::string searchKey = "\"" + key + "\":";
    size_t pos = json.find(searchKey);
    if (pos == std::string::npos) return "";

    pos += searchKey.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t' || json[pos] == '\n' || json[pos] == '\r')) pos++;

    if (pos >= json.length()) return "";

    if (json[pos] == '"') {
        size_t start = pos + 1;
        size_t end = json.find('"', start);
        if (end != std::string::npos) {
            return json.substr(start, end - start);
        }
    } else {
        size_t end = json.find_first_of(",}\n\r", pos);
        if (end != std::string::npos) {
            return json.substr(pos, end - pos);
        }
    }
    return "";
}

// Extract string array from JSON
std::vector<std::string> getJsonArray(const std::string& json, const std::string& key) {
    std::vector<std::string> result;
    std::string searchKey = "\"" + key + "\":";
    size_t pos = json.find(searchKey);
    if (pos == std::string::npos) return result;

    size_t start = json.find('[', pos);
    size_t end = json.find(']', start);
    if (start == std::string::npos || end == std::string::npos) return result;

    std::string arrStr = json.substr(start + 1, end - start - 1);
    std::stringstream ss(arrStr);
    std::string item;
    while (std::getline(ss, item, ',')) {
        size_t q1 = item.find('"');
        size_t q2 = item.rfind('"');
        if (q1 != std::string::npos && q2 != std::string::npos && q2 > q1) {
            result.push_back(item.substr(q1 + 1, q2 - q1 - 1));
        } else {
            // Trim whitespace
            item.erase(0, item.find_first_not_of(" \t\n\r"));
            item.erase(item.find_last_not_of(" \t\n\r") + 1);
            if (!item.empty()) result.push_back(item);
        }
    }
    return result;
}

// Build JSON response
std::string buildHttpResponse(const std::string& body, int status = 200, const std::string& contentType = "application/json") {
    std::stringstream ss;
    ss << "HTTP/1.1 " << status << " OK\r\n";
    ss << "Content-Type: " << contentType << "\r\n";
    ss << "Access-Control-Allow-Origin: *\r\n";
    ss << "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
    ss << "Access-Control-Allow-Headers: Content-Type, Authorization\r\n";
    ss << "Content-Length: " << body.length() << "\r\n";
    ss << "\r\n";
    ss << body;
    return ss.str();
}

// Handler for matching requests
std::string handleMatch(const std::string& body) {
    auto start = std::chrono::high_resolution_clock::now();
    totalMatchesRun++;

    StudentProfile student;
    student.studentId = 1;
    student.fullName = getJsonField(body, "fullName");
    std::string cgpaStr = getJsonField(body, "cgpa");
    student.cgpa = cgpaStr.empty() ? 7.5 : std::stod(cgpaStr);
    student.preferredDomain = getJsonField(body, "preferredDomain");
    student.preferredWorkMode = getJsonField(body, "preferredWorkMode");
    student.preferredLocations = getJsonArray(body, "preferredLocations");
    student.skills = getJsonArray(body, "skills");

    // Pre-populate skills if empty
    if (student.skills.empty()) {
        student.skills = {"C++", "DSA", "SQL", "React", "Node.js"};
    }

    // Mock/Received internships list to match against
    std::vector<InternshipData> internships;
    // We parse basic internship objects or provide realistic sample matches
    // In production, Node.js passes the internship array in body
    size_t internshipsPos = body.find("\"internships\":");
    if (internshipsPos != std::string::npos) {
        // Simple parser for passed internships array
        size_t pos = internshipsPos;
        while ((pos = body.find("{\"id\":", pos)) != std::string::npos) {
            size_t objEnd = body.find("}", pos);
            if (objEnd == std::string::npos) break;
            std::string sub = body.substr(pos, objEnd - pos + 1);

            InternshipData idata;
            std::string idStr = getJsonField(sub, "id");
            idata.id = idStr.empty() ? 1 : std::stoi(idStr);
            idata.title = getJsonField(sub, "title");
            idata.companyName = getJsonField(sub, "companyName");
            idata.domain = getJsonField(sub, "domain");
            std::string minCgpaStr = getJsonField(sub, "minCgpa");
            idata.minCgpa = minCgpaStr.empty() ? 6.0 : std::stod(minCgpaStr);
            idata.location = getJsonField(sub, "location");
            idata.workMode = getJsonField(sub, "workMode");
            std::string stStr = getJsonField(sub, "stipendMonthly");
            idata.stipendMonthly = stStr.empty() ? 25000 : std::stoi(stStr);
            idata.requiredSkills = getJsonArray(sub, "requiredSkills");

            internships.push_back(idata);
            pos = objEnd + 1;
        }
    }

    // Fallback default internship set if none passed
    if (internships.empty()) {
        internships = {
            {101, "C++ Systems Software Intern", "Google", "Software Engineering", 8.0, "Bangalore", "HYBRID", 45000, 5, {"C++", "DSA", "SQL", "System Design"}},
            {102, "Full Stack Web Developer Intern", "Zoho", "Web Development", 7.0, "Chennai", "ON_SITE", 30000, 10, {"React", "Node.js", "SQL", "JavaScript"}},
            {103, "Backend Systems Intern", "Microsoft", "Backend Development", 7.5, "Hyderabad", "HYBRID", 50000, 3, {"C++", "Node.js", "SQL", "Docker"}},
            {104, "Data Structures & AI Intern", "Freshworks", "Artificial Intelligence", 8.0, "Chennai", "REMOTE", 35000, 4, {"Python", "C++", "DSA", "SQL"}},
            {105, "Frontend UI Developer Intern", "Wipro", "Frontend Development", 6.5, "Bangalore", "REMOTE", 20000, 15, {"React", "HTML", "CSS", "JavaScript"}}
        };
    }

    // Rank internships using Priority Queue (Max Heap)
    struct MatchComparator {
        bool operator()(const MatchResult& a, const MatchResult& b) const {
            return a.matchScore < b.matchScore; // Heap with standard less -> Max Heap behavior in our CustomPriorityQueue
        }
    };

    CustomPriorityQueue<MatchResult, MatchComparator> pq;

    for (const auto& intern : internships) {
        MatchResult res = MatchingEngine::calculateMatch(student, intern);
        pq.push(res);
    }

    std::vector<MatchResult> rankedResults;
    while (!pq.empty()) {
        rankedResults.push_back(pq.top());
        pq.pop();
    }

    auto end = std::chrono::high_resolution_clock::now();
    double durationMs = std::chrono::duration<double, std::milli>(end - start).count();

    std::stringstream resJson;
    resJson << "{\n";
    resJson << "  \"success\": true,\n";
    resJson << "  \"engine\": \"C++ DSA Matching Engine v1.0\",\n";
    resJson << "  \"algorithm\": \"Priority Queue (Max Heap) + Custom HashMap + Multi-factor Weighting\",\n";
    resJson << "  \"timeComplexity\": \"O(N log N + K)\",\n";
    resJson << "  \"spaceComplexity\": \"O(N + K)\",\n";
    resJson << "  \"executionTimeMs\": " << durationMs << ",\n";
    resJson << "  \"totalProcessed\": " << internships.size() << ",\n";
    resJson << "  \"results\": [\n";

    for (size_t i = 0; i < rankedResults.size(); ++i) {
        const auto& r = rankedResults[i];
        resJson << "    {\n";
        resJson << "      \"internshipId\": " << r.internshipId << ",\n";
        resJson << "      \"title\": \"" << r.title << "\",\n";
        resJson << "      \"companyName\": \"" << r.companyName << "\",\n";
        resJson << "      \"matchScore\": " << r.matchScore << ",\n";
        resJson << "      \"isEligible\": " << (r.isEligible ? "true" : "false") << ",\n";
        resJson << "      \"explanation\": \"" << r.explanation << "\",\n";
        resJson << "      \"matchedSkills\": [";
        for (size_t k = 0; k < r.matchedSkills.size(); ++k) {
            resJson << "\"" << r.matchedSkills[k] << "\"" << (k + 1 < r.matchedSkills.size() ? ", " : "");
        }
        resJson << "],\n";
        resJson << "      \"missingSkills\": [";
        for (size_t k = 0; k < r.missingSkills.size(); ++k) {
            resJson << "\"" << r.missingSkills[k] << "\"" << (k + 1 < r.missingSkills.size() ? ", " : "");
        }
        resJson << "]\n";
        resJson << "    }" << (i + 1 < rankedResults.size() ? "," : "") << "\n";
    }

    resJson << "  ]\n";
    resJson << "}";

    return resJson.str();
}

// Handler for seat allocation
std::string handleAllocate(const std::string& body) {
    auto start = std::chrono::high_resolution_clock::now();
    totalAllocationsRun++;

    std::string seatsStr = getJsonField(body, "totalSeats");
    int totalSeats = seatsStr.empty() ? 3 : std::stoi(seatsStr);

    std::vector<CandidateRank> candidates;
    // Extract candidates
    size_t candPos = body.find("\"candidates\":");
    if (candPos != std::string::npos) {
        size_t pos = candPos;
        while ((pos = body.find("{\"studentId\":", pos)) != std::string::npos) {
            size_t objEnd = body.find("}", pos);
            if (objEnd == std::string::npos) break;
            std::string sub = body.substr(pos, objEnd - pos + 1);

            CandidateRank c;
            c.applicationId = std::stoi(getJsonField(sub, "applicationId").empty() ? "0" : getJsonField(sub, "applicationId"));
            c.studentId = std::stoi(getJsonField(sub, "studentId").empty() ? "0" : getJsonField(sub, "studentId"));
            c.studentName = getJsonField(sub, "studentName");
            c.cgpa = std::stod(getJsonField(sub, "cgpa").empty() ? "7.0" : getJsonField(sub, "cgpa"));
            c.matchScore = std::stoi(getJsonField(sub, "matchScore").empty() ? "70" : getJsonField(sub, "matchScore"));
            std::string eligStr = getJsonField(sub, "isEligible");
            c.isEligible = (eligStr == "true" || eligStr == "1");

            candidates.push_back(c);
            pos = objEnd + 1;
        }
    }

    if (candidates.empty()) {
        candidates = {
            {10, 1, "Aarav Sharma", 8.9, 94, true, false, ""},
            {11, 2, "Priya Patel", 9.2, 88, true, false, ""},
            {12, 3, "Rohan Verma", 7.8, 91, true, false, ""},
            {13, 4, "Sneha Reddy", 6.2, 85, false, false, ""},
            {14, 5, "Vikram Singh", 8.4, 79, true, false, ""}
        };
    }

    std::vector<CandidateRank> allocated = SeatAllocator::allocateSeatsGreedy(totalSeats, candidates);

    auto end = std::chrono::high_resolution_clock::now();
    double durationMs = std::chrono::duration<double, std::milli>(end - start).count();

    std::stringstream resJson;
    resJson << "{\n";
    resJson << "  \"success\": true,\n";
    resJson << "  \"algorithm\": \"Greedy Seat Allocation + Priority Queue Ranking\",\n";
    resJson << "  \"timeComplexity\": \"O(K log K)\",\n";
    resJson << "  \"spaceComplexity\": \"O(K)\",\n";
    resJson << "  \"executionTimeMs\": " << durationMs << ",\n";
    resJson << "  \"totalSeats\": " << totalSeats << ",\n";
    resJson << "  \"allocations\": [\n";

    for (size_t i = 0; i < allocated.size(); ++i) {
        const auto& c = allocated[i];
        resJson << "    {\n";
        resJson << "      \"applicationId\": " << c.applicationId << ",\n";
        resJson << "      \"studentId\": " << c.studentId << ",\n";
        resJson << "      \"studentName\": \"" << c.studentName << "\",\n";
        resJson << "      \"cgpa\": " << c.cgpa << ",\n";
        resJson << "      \"matchScore\": " << c.matchScore << ",\n";
        resJson << "      \"isEligible\": " << (c.isEligible ? "true" : "false") << ",\n";
        resJson << "      \"isAllocated\": " << (c.isAllocated ? "true" : "false") << ",\n";
        resJson << "      \"allocationReason\": \"" << c.allocationReason << "\"\n";
        resJson << "    }" << (i + 1 < allocated.size() ? "," : "") << "\n";
    }

    resJson << "  ]\n";
    resJson << "}";

    return resJson.str();
}

// Handler for skill graph requests
std::string handleGraphSkills(const std::string& body) {
    totalGraphSearchesRun++;

    std::string rootSkill = getJsonField(body, "skill");
    if (rootSkill.empty()) rootSkill = "C++";

    SkillGraph graph;
    // Build initial skill graph
    graph.addPrerequisiteOrRelation("C++", "DSA");
    graph.addPrerequisiteOrRelation("DSA", "Algorithms");
    graph.addPrerequisiteOrRelation("Algorithms", "Software Engineering");
    graph.addPrerequisiteOrRelation("C++", "System Design");
    graph.addPrerequisiteOrRelation("React", "JavaScript");
    graph.addPrerequisiteOrRelation("JavaScript", "Node.js");
    graph.addPrerequisiteOrRelation("Node.js", "Express");
    graph.addPrerequisiteOrRelation("Express", "REST API");
    graph.addPrerequisiteOrRelation("REST API", "PostgreSQL");
    graph.addPrerequisiteOrRelation("PostgreSQL", "Database Design");
    graph.addPrerequisiteOrRelation("Node.js", "Docker");
    graph.addPrerequisiteOrRelation("Python", "Data Structures");
    graph.addPrerequisiteOrRelation("Data Structures", "Machine Learning");

    std::vector<std::string> relatedBFS = graph.getRelatedSkillsBFS(rootSkill, 2);
    std::vector<std::string> roadmapDFS = graph.getLearningRoadmapDFS(rootSkill, 5);

    std::stringstream resJson;
    resJson << "{\n";
    resJson << "  \"success\": true,\n";
    resJson << "  \"algorithm\": \"Graph BFS (Breadth First Search) & DFS (Depth First Search)\",\n";
    resJson << "  \"timeComplexity\": \"O(V + E)\",\n";
    resJson << "  \"spaceComplexity\": \"O(V)\",\n";
    resJson << "  \"rootSkill\": \"" << rootSkill << "\",\n";
    resJson << "  \"relatedSkillsBFS\": [";
    for (size_t i = 0; i < relatedBFS.size(); ++i) {
        resJson << "\"" << relatedBFS[i] << "\"" << (i + 1 < relatedBFS.size() ? ", " : "");
    }
    resJson << "],\n";
    resJson << "  \"learningPathDFS\": [";
    for (size_t i = 0; i < roadmapDFS.size(); ++i) {
        resJson << "\"" << roadmapDFS[i] << "\"" << (i + 1 < roadmapDFS.size() ? ", " : "");
    }
    resJson << "]\n";
    resJson << "}";

    return resJson.str();
}

// Server runner
int main(int argc, char* argv[]) {
    // Check if CLI JSON execution mode requested
    if (argc > 1 && std::string(argv[1]) == "--cli") {
        std::string command = (argc > 2) ? argv[2] : "match";
        std::string inputJson = (argc > 3) ? argv[3] : "{}";
        if (command == "match") {
            std::cout << handleMatch(inputJson) << std::endl;
        } else if (command == "allocate") {
            std::cout << handleAllocate(inputJson) << std::endl;
        } else if (command == "graph") {
            std::cout << handleGraphSkills(inputJson) << std::endl;
        }
        return 0;
    }

    std::cout << "[C++ DSA Engine] Starting InternHub C++ High-Performance DSA Engine..." << std::endl;

#ifdef _WIN32
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed." << std::endl;
        return 1;
    }
#endif

    SOCKET serverSock = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSock == INVALID_SOCKET) {
        std::cerr << "Failed to create socket." << std::endl;
        return 1;
    }

    int opt = 1;
    setsockopt(serverSock, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));

    sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(7000);

    if (bind(serverSock, (struct sockaddr*)&address, sizeof(address)) == SOCKET_ERROR) {
        std::cerr << "Bind failed on port 7000. Operating in fallback mode." << std::endl;
        return 1;
    }

    if (listen(serverSock, 10) == SOCKET_ERROR) {
        std::cerr << "Listen failed." << std::endl;
        return 1;
    }

    std::cout << "=========================================================" << std::endl;
    std::cout << "  INTERNHUB C++ DSA ENGINE RUNNING AT http://localhost:7000" << std::endl;
    std::cout << "  - O(1) Custom HashMap Indexing" << std::endl;
    std::cout << "  - O(V+E) Skill Relationship Graph (BFS & DFS)" << std::endl;
    std::cout << "  - O(N log N) Priority Queue / Max Heap Ranking" << std::endl;
    std::cout << "  - O(K log K) Greedy Seat Allocation Engine" << std::endl;
    std::cout << "=========================================================" << std::endl;

    while (true) {
        SOCKET clientSock = accept(serverSock, NULL, NULL);
        if (clientSock == INVALID_SOCKET) continue;

        char buffer[8192] = {0};
        int bytesRead = recv(clientSock, buffer, sizeof(buffer) - 1, 0);
        if (bytesRead > 0) {
            std::string request(buffer, bytesRead);

            // Options preflight for CORS
            if (request.rfind("OPTIONS", 0) == 0) {
                std::string resp = buildHttpResponse("", 200);
                send(clientSock, resp.c_str(), resp.length(), 0);
            } else {
                // Extract body
                size_t bodyPos = request.find("\r\n\r\n");
                std::string body = (bodyPos != std::string::npos) ? request.substr(bodyPos + 4) : "";

                std::string jsonResult;
                if (request.find("POST /match") != std::string::npos || request.find("GET /match") != std::string::npos) {
                    jsonResult = handleMatch(body);
                } else if (request.find("POST /allocate") != std::string::npos) {
                    jsonResult = handleAllocate(body);
                } else if (request.find("POST /graph") != std::string::npos || request.find("GET /graph") != std::string::npos) {
                    jsonResult = handleGraphSkills(body);
                } else if (request.find("GET /health") != std::string::npos) {
                    jsonResult = "{\"status\":\"ok\",\"engine\":\"C++ DSA Engine v1.0\",\"totalMatches\":" + std::to_string(totalMatchesRun) + "}";
                } else {
                    jsonResult = handleMatch(body);
                }

                std::string httpResp = buildHttpResponse(jsonResult);
                send(clientSock, httpResp.c_str(), httpResp.length(), 0);
            }
        }
        closesocket(clientSock);
    }

#ifdef _WIN32
    WSACleanup();
#endif
    return 0;
}
