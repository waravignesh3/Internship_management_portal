const axios = require('axios');
const dsaService = require('../dsaService');

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'gemini';
    this.apiKey = process.env.AI_API_KEY || '';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  async callGeminiApi(prompt, systemInstruction = '') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction ? systemInstruction + '\n\n' : ''}${prompt}` }]
        }
      ]
    };

    const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 12000 });
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || 'No response from AI model.';
  }

  // 1. AI Chatbot
  async chat(userMessage, studentContext = {}) {
    if (this.isConfigured()) {
      try {
        const sysMsg = `You are InternHub AI, an intelligent, encouraging career advisor and internship coach. 
Student Context:
- Name: ${studentContext.full_name || 'Student'}
- CGPA: ${studentContext.cgpa || 'N/A'}
- Preferred Domain: ${studentContext.preferred_domain || 'Software Engineering'}
- Skills: ${Array.isArray(studentContext.skills) ? studentContext.skills.join(', ') : 'C++, DSA, React, SQL'}
Provide concise, highly relevant advice based strictly on authorized student context. Do not reveal private user keys.`;

        const text = await this.callGeminiApi(userMessage, sysMsg);
        return { success: true, provider: this.provider, isFallback: false, response: text };
      } catch (err) {
        console.warn('[AI Service] Gemini call failed, falling back to rule-based assistant:', err.message);
      }
    }

    // Rule-based fallback response
    let responseText = "Hello! I am your InternHub AI assistant. Currently running in DSA rule-based fallback mode.\n\n";
    const lower = userMessage.toLowerCase();

    if (lower.includes('internship') || lower.includes('suit') || lower.includes('eligible')) {
      responseText += `Based on your profile skills (${studentContext.skills ? studentContext.skills.join(', ') : 'C++, DSA, SQL'}), you are well-matched for Software Engineering, Backend, and C++ Systems Developer roles! Check out our DSA Engine Recommendations page for high match scores.`;
    } else if (lower.includes('skill') || lower.includes('learn') || lower.includes('gap')) {
      responseText += `To improve your internship readiness, we recommend focusing on Docker, System Design, Microservices, and Cloud Infrastructure (AWS) alongside your core C++ and DSA foundation.`;
    } else if (lower.includes('interview') || lower.includes('prepare')) {
      responseText += `Key topics to prepare:\n1. Data Structures: Graphs (BFS/DFS), Heaps/Priority Queues, Hash Maps.\n2. System Design: Caching, Database Indexing, Load Balancing.\n3. Behavioral: STAR method responses.`;
    } else if (lower.includes('resume') || lower.includes('project')) {
      responseText += `Try building a High-Throughput C++ Matching Engine or a Distributed Task Queue to showcase system programming skills on your resume.`;
    } else {
      responseText += `I can help you analyze your skill gap, recommend internships, tailor your resume, or prepare for technical interviews. What would you like to work on today?`;
    }

    return {
      success: true,
      provider: 'DSA Rule-Based Fallback',
      isFallback: true,
      response: responseText
    };
  }

  // 2. AI Skill Gap Analyzer
  async analyzeSkillGap(studentSkills = [], targetRoleOrInternship = {}) {
    const requiredSkills = targetRoleOrInternship.requiredSkills || ['C++', 'DSA', 'System Design', 'Docker', 'PostgreSQL'];
    const studentSkillSet = new Set(studentSkills.map(s => s.toLowerCase()));

    const possessed = [];
    const missing = [];

    for (const req of requiredSkills) {
      if (studentSkillSet.has(req.toLowerCase())) {
        possessed.push(req);
      } else {
        missing.push(req);
      }
    }

    if (this.isConfigured()) {
      try {
        const prompt = `Perform a detailed skill-gap analysis for a student targeting '${targetRoleOrInternship.title || 'Backend Engineer'}'. 
Possessed Skills: ${possessed.join(', ')}
Missing Skills: ${missing.join(', ')}
Return a structured JSON with key learning suggestions.`;
        const aiText = await this.callGeminiApi(prompt);
        return { success: true, isFallback: false, possessed, missing, aiAnalysis: aiText };
      } catch (err) {
        console.warn('[AI Service] Skill gap AI call fallback:', err.message);
      }
    }

    return {
      success: true,
      isFallback: true,
      possessed,
      missing,
      suggestions: [
        { skill: missing[0] || 'Docker', priority: 'HIGH', learningOrder: 1, reason: 'Crucial containerization skill demanded by top companies.' },
        { skill: missing[1] || 'System Design', priority: 'MEDIUM', learningOrder: 2, reason: 'Essential for technical interview rounds and architecture design.' },
        { skill: missing[2] || 'AWS', priority: 'LOW', learningOrder: 3, reason: 'Good cloud experience for enterprise production deployments.' }
      ]
    };
  }

  // 3. AI Resume Assistant
  async improveResume(studentProfile, targetInternship) {
    if (this.isConfigured()) {
      try {
        const prompt = `Tailor the following student resume bullet points for the target internship '${targetInternship.title}' requiring [${targetInternship.requiredSkills?.join(', ')}].
Current Profile Summary: ${studentProfile.bio}
Return tailored summary and bullet points.`;
        const text = await this.callGeminiApi(prompt);
        return { success: true, isFallback: false, tailoredResume: text };
      } catch (err) {
        console.warn('[AI Service] Resume AI call fallback:', err.message);
      }
    }

    return {
      success: true,
      isFallback: true,
      tailoredSummary: `Engineered high-performance software systems utilizing ${studentProfile.skills?.slice(0, 3).join(', ')}. Demonstrated strong problem-solving capabilities in C++ Data Structures and Algorithms with a CGPA of ${studentProfile.cgpa}.`,
      improvedProjects: [
        `Architected a DSA-driven matching algorithm utilizing Priority Queues (Max Heap) and Custom Hash Maps, optimizing candidate ranking time complexity to O(N log N).`,
        `Integrated PostgreSQL database schemas with full relational normalization, primary/foreign keys, and indexed queries for sub-50ms execution.`
      ],
      suggestedKeywords: targetInternship?.requiredSkills || ['C++', 'DSA', 'SQL', 'System Design', 'Docker']
    };
  }

  // 4. AI Career Advisor
  async getCareerAdvice(studentProfile, targetCareer = 'Software Engineer') {
    return {
      success: true,
      targetCareer,
      currentSkills: studentProfile.skills || ['C++', 'DSA', 'SQL'],
      roadmap: [
        { phase: 'Phase 1: Foundations', target: 'Master C++17, Memory Management, and Core DSA (Graph, Heap, Sorting).' },
        { phase: 'Phase 2: Full Stack Integration', target: 'Build Node.js REST APIs connected to PostgreSQL databases.' },
        { phase: 'Phase 3: DevOps & Scale', target: 'Deploy containers with Docker and master System Design principles.' }
      ]
    };
  }

  // 5. AI Interview Prep
  async generateInterviewPrep(companyName, internshipTitle, userResponse = '') {
    const defaultQuestions = [
      { id: 1, type: 'DSA', question: 'How would you implement a Priority Queue from scratch in C++ to rank candidate applications?', guidance: 'Focus on binary max heaps, heapifyUp, and heapifyDown O(log N) operations.' },
      { id: 2, type: 'TECHNICAL', question: 'Explain how database indexing in PostgreSQL improves query performance from O(N) to O(log N).', guidance: 'Discuss B-Tree data structures, index scans, and maintenance trade-offs.' },
      { id: 3, type: 'BEHAVIORAL', question: 'Describe a challenging bug you encountered in a C++ or web project and how you debugged it.', guidance: 'Use the STAR method: Situation, Task, Action, Result.' }
    ];

    let feedback = null;
    if (userResponse && userResponse.trim().length > 5) {
      feedback = {
        score: 88,
        strengths: ['Clear algorithmic explanation', 'Good identification of time complexities'],
        improvements: ['Include explicit edge case handling for empty inputs', 'Mention memory overhead space complexity']
      };
    }

    return {
      success: true,
      companyName: companyName || 'Google',
      internshipTitle: internshipTitle || 'C++ Systems Software Intern',
      questions: defaultQuestions,
      evaluation: feedback
    };
  }

  // 6. AI Project Recommendations
  async recommendProjects(targetRole = 'Backend Developer', currentSkills = ['C++', 'SQL']) {
    return {
      success: true,
      recommendedProjects: [
        {
          title: 'DSA-Powered Internship Matching Engine',
          difficulty: 'ADVANCED',
          technologies: ['C++17', 'Priority Queue', 'Custom HashMap', 'REST API'],
          description: 'A native C++ microservice calculating 6-factor candidate match scores and allocating seats using greedy algorithms.',
          skillsGained: ['C++ Performance Optimization', 'Graph Traversals', 'Max Heap']
        },
        {
          title: 'Distributed Log & Activity Monitor',
          difficulty: 'INTERMEDIATE',
          technologies: ['Node.js', 'PostgreSQL', 'Redis', 'React'],
          description: 'Real-time activity logging and dashboard system with automated anomaly detection.',
          skillsGained: ['Database Indexing', 'Full-stack REST APIs', 'Recharts Visualizations']
        }
      ]
    };
  }
}

module.exports = new AIService();
