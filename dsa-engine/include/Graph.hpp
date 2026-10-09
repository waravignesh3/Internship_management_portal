#ifndef GRAPH_HPP
#define GRAPH_HPP

#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <algorithm>

class SkillGraph {
private:
    std::unordered_map<std::string, std::vector<std::string>> adjList;

public:
    SkillGraph() {}

    void addSkill(const std::string& skill) {
        if (adjList.find(skill) == adjList.end()) {
            adjList[skill] = std::vector<std::string>();
        }
    }

    void addPrerequisiteOrRelation(const std::string& skillA, const std::string& skillB) {
        addSkill(skillA);
        addSkill(skillB);
        adjList[skillA].push_back(skillB);
        adjList[skillB].push_back(skillA); // Undirected relationship
    }

    std::vector<std::string> getRelatedSkillsBFS(const std::string& startSkill, int maxDepth = 2) {
        std::vector<std::string> result;
        if (adjList.find(startSkill) == adjList.end()) return result;

        std::unordered_set<std::string> visited;
        std::queue<std::pair<std::string, int>> q;

        q.push({startSkill, 0});
        visited.insert(startSkill);

        while (!q.empty()) {
            auto [current, depth] = q.front();
            q.pop();

            if (depth > 0) {
                result.push_back(current);
            }

            if (depth < maxDepth) {
                for (const auto& neighbor : adjList[current]) {
                    if (visited.find(neighbor) == visited.end()) {
                        visited.insert(neighbor);
                        q.push({neighbor, depth + 1});
                    }
                }
            }
        }
        return result;
    }

    void dfsHelper(const std::string& current, std::unordered_set<std::string>& visited, std::vector<std::string>& path, int limit) {
        if ((int)path.size() >= limit) return;
        visited.insert(current);
        path.push_back(current);

        for (const auto& neighbor : adjList[current]) {
            if (visited.find(neighbor) == visited.end() && (int)path.size() < limit) {
                dfsHelper(neighbor, visited, path, limit);
            }
        }
    }

    std::vector<std::string> getLearningRoadmapDFS(const std::string& startSkill, int limit = 5) {
        std::vector<std::string> path;
        if (adjList.find(startSkill) == adjList.end()) return path;

        std::unordered_set<std::string> visited;
        dfsHelper(startSkill, visited, path, limit);
        return path;
    }
};

#endif
