const axios = require('axios');

class AIService {
  getApiKey() {
    return (process.env.AI_API_KEY || '').trim();
  }

  getProvider() {
    return (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  }

  isConfigured() {
    const key = this.getApiKey();
    return Boolean(key && key.length > 5);
  }

  /**
   * Primary Gemini API call supporting system instructions, multi-turn chat history,
   * model fallback, and clean error handling.
   */
  async callGeminiApi(prompt, systemInstruction = '', history = []) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('AI_API_KEY is missing in backend configuration.');
    }

    const contents = [];

    // Process multi-turn chat history
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        if (!msg) continue;
        const text = msg.text || msg.content || '';
        if (!text.trim()) continue;

        const role = (msg.sender === 'USER' || msg.role === 'user') ? 'user' : 'model';
        contents.push({
          role,
          parts: [{ text: text.trim() }]
        });
      }
    }

    // Append current prompt if not already the latest item in contents
    if (prompt && prompt.trim()) {
      const last = contents[contents.length - 1];
      if (!last || last.role !== 'user' || last.parts[0].text !== prompt.trim()) {
        contents.push({
          role: 'user',
          parts: [{ text: prompt.trim() }]
        });
      }
    }

    if (contents.length === 0) {
      throw new Error('No user message provided for AI generation.');
    }

    const payload = {
      contents,
      ...(systemInstruction ? {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      } : {}),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    };

    const modelsToTry = [
      process.env.GEMINI_MODEL,   // Allow override via env var
      'gemini-3.8-flash',          // Recommended for new API keys (Google's latest)
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-pro-latest'
    ].filter(Boolean);

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await axios.post(url, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        });

        const candidates = response.data?.candidates;
        if (candidates && candidates.length > 0) {
          const textPart = candidates[0]?.content?.parts?.[0]?.text;
          if (textPart) return textPart;
        }
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const apiErrMsg = err.response?.data?.error?.message || err.message;
        console.warn(`[AI Service] Gemini model ${model} returned error (${status}): ${apiErrMsg}`);

        // If auth failure, don't keep testing other models
        if (status === 401 || status === 403) {
          throw new Error(`Gemini Authentication Error (${status}): ${apiErrMsg}`);
        }
      }
    }

    throw lastError || new Error('Failed to get response from Gemini API.');
  }

  // 1. Multi-turn AI Chatbot
  async chat(userMessage, studentContext = {}, history = []) {
    if (this.isConfigured()) {
      try {
        const completionInfo = studentContext.completionDetails || {};
        const missingSectionsList = Array.isArray(completionInfo.sections)
          ? completionInfo.sections.filter(s => !s.isComplete).map(s => s.title).join(', ')
          : 'None';

        const sysInstruction = `You are InternHub AI, the conversational career assistant for an Internship Management Portal. Help students discover internships, understand job descriptions, improve resumes, prepare for interviews, identify skill gaps, and create career-development plans. Provide natural, detailed, helpful answers and ask clarifying questions when needed. Use actual authorized application data when available. Never invent internship vacancies, application statuses, recruiter details, or student profile information. If a question requires current application data, obtain it from the authenticated backend rather than guessing. Never expose another user's private information. Do not claim to have changed a profile or submitted an application unless the relevant backend operation confirms success. Answer general questions helpfully while prioritizing internships, career growth, and professional development.

Authenticated Student Profile Context:
- Full Name: ${studentContext.full_name || 'Student'}
- College & Department: ${studentContext.college_name || 'N/A'} (${studentContext.department || 'N/A'})
- CGPA: ${studentContext.cgpa || 'N/A'}
- Preferred Domain: ${studentContext.preferred_domain || 'Software Engineering'}
- Preferred Locations: ${studentContext.preferred_locations || 'Remote / Hybrid'}
- Skills: ${Array.isArray(studentContext.skills) ? studentContext.skills.join(', ') : 'Not set'}
- Profile Completion: ${studentContext.profile_completion || 0}%
- Missing Profile Sections: ${missingSectionsList || 'Profile is complete'}
- Bio: ${studentContext.bio || 'Not provided'}
- Applications Sent: ${studentContext.totalApplications || 0}`;

        const aiResponseText = await this.callGeminiApi(userMessage, sysInstruction, history);
        return {
          success: true,
          provider: 'Google Gemini AI',
          isFallback: false,
          response: aiResponseText
        };
      } catch (err) {
        console.warn('[AI Service] Gemini call failed:', err.message);
        return {
          success: false,
          provider: 'Google Gemini AI',
          isFallback: true,
          error: err.message,
          response: `Notice: Gemini API request failed (${err.message}). Please ensure a valid AI_API_KEY is configured in backend environment variables.`
        };
      }
    }

    // Fallback response when AI_API_KEY is not set
    return {
      success: true,
      provider: 'InternHub Career Assistant (Setup Required)',
      isFallback: true,
      response: `InternHub AI is ready to connect! To activate real conversational Gemini answers, please configure a valid AI_API_KEY in backend/.env.\n\nIn the meantime, make sure to complete your profile, list your skills, and explore internship opportunities on the portal!`
    };
  }

  // 2. Skill Gap Analyzer
  async analyzeSkillGap(studentSkills = [], targetRoleOrInternship = {}) {
    const requiredSkills = targetRoleOrInternship.requiredSkills || ['React', 'Node.js', 'PostgreSQL', 'System Design', 'Docker'];
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
Possessed Skills: ${possessed.join(', ') || 'None'}
Missing Skills: ${missing.join(', ') || 'None'}
Provide actionable learning steps and resources.`;
        const aiText = await this.callGeminiApi(prompt);
        return { success: true, isFallback: false, possessed, missing, aiAnalysis: aiText };
      } catch (err) {
        console.warn('[AI Service] Skill gap AI call failed:', err.message);
      }
    }

    return {
      success: true,
      isFallback: true,
      possessed,
      missing,
      suggestions: [
        { skill: missing[0] || 'Docker', priority: 'HIGH', learningOrder: 1, reason: 'Crucial containerization skill demanded by top tech companies.' },
        { skill: missing[1] || 'System Design', priority: 'MEDIUM', learningOrder: 2, reason: 'Essential for technical interview rounds and scalable backend design.' },
        { skill: missing[2] || 'Cloud Services', priority: 'LOW', learningOrder: 3, reason: 'Good experience for production deployments.' }
      ]
    };
  }

  // 3. Resume Assistant
  async improveResume(studentProfile, targetInternship) {
    if (this.isConfigured()) {
      try {
        const prompt = `Tailor the following student resume summary and project bullet points for target internship '${targetInternship.title}' requiring [${targetInternship.requiredSkills?.join(', ')}].
Current Profile Summary: ${studentProfile.bio || 'Computer Science student'}
Current Skills: ${Array.isArray(studentProfile.skills) ? studentProfile.skills.join(', ') : 'Software Development'}
Provide a polished professional summary and 3 impactful bullet points.`;
        const text = await this.callGeminiApi(prompt);
        return { success: true, isFallback: false, tailoredResume: text };
      } catch (err) {
        console.warn('[AI Service] Resume AI call failed:', err.message);
      }
    }

    return {
      success: true,
      isFallback: true,
      tailoredSummary: `Enthusiastic software engineering student skilled in ${Array.isArray(studentProfile.skills) ? studentProfile.skills.slice(0, 3).join(', ') : 'full-stack development'}. Demonstrates strong problem-solving capabilities with a CGPA of ${studentProfile.cgpa || '8.5'}.`,
      improvedProjects: [
        `Architected full-stack web application with responsive UI, real-time API integrations, and robust database indexing.`,
        `Optimized API performance and endpoint query handling, reducing response latency for data-heavy dashboard endpoints.`
      ],
      suggestedKeywords: targetInternship?.requiredSkills || ['React', 'Node.js', 'SQL', 'REST API', 'System Design']
    };
  }

  // 4. Career Advisor
  async getCareerAdvice(studentProfile, targetCareer = 'Software Engineer') {
    if (this.isConfigured()) {
      try {
        const prompt = `Provide a structured 3-phase career roadmap for a student aiming to become a '${targetCareer}'. Current skills: ${Array.isArray(studentProfile.skills) ? studentProfile.skills.join(', ') : 'Programming'}.`;
        const aiText = await this.callGeminiApi(prompt);
        return { success: true, isFallback: false, targetCareer, aiRoadmap: aiText };
      } catch (err) {
        console.warn('[AI Service] Career advice AI call failed:', err.message);
      }
    }

    return {
      success: true,
      isFallback: true,
      targetCareer,
      currentSkills: studentProfile.skills || ['React', 'Node.js', 'SQL'],
      roadmap: [
        { phase: 'Phase 1: Core Foundations', target: 'Master Data Structures, Algorithms, and Modern Web Application Architecture.' },
        { phase: 'Phase 2: Full-Stack Mastery', target: 'Build production-grade REST APIs and database schema migrations.' },
        { phase: 'Phase 3: Production & DevOps', target: 'Containerize with Docker, learn cloud deployment, and practice system design interviews.' }
      ]
    };
  }

  // 5. Interview Prep
  async generateInterviewPrep(companyName, internshipTitle, userResponse = '') {
    if (this.isConfigured()) {
      try {
        const prompt = userResponse
          ? `Evaluate the student's technical answer for '${internshipTitle}' at '${companyName}': "${userResponse}". Provide constructive feedback, score out of 100, strengths, and improvements.`
          : `Generate 3 realistic interview questions (Technical, System Design, Behavioral) for '${internshipTitle}' at '${companyName}' with guidance for great answers.`;
        const aiText = await this.callGeminiApi(prompt);
        return { success: true, isFallback: false, companyName, internshipTitle, aiContent: aiText };
      } catch (err) {
        console.warn('[AI Service] Interview prep AI call failed:', err.message);
      }
    }

    const defaultQuestions = [
      { id: 1, type: 'TECHNICAL', question: 'How do you optimize state management and re-renders in a React web application?', guidance: 'Discuss memoization, hooks, and local vs global state.' },
      { id: 2, type: 'SYSTEM DESIGN', question: 'Explain how database indexing improves query lookup times and when indexes should be avoided.', guidance: 'Discuss B-Trees, write overhead, and cardinalities.' },
      { id: 3, type: 'BEHAVIORAL', question: 'Describe a challenging technical bug you encountered and how you systematically resolved it.', guidance: 'Use the STAR method: Situation, Task, Action, Result.' }
    ];

    let feedback = null;
    if (userResponse && userResponse.trim().length > 5) {
      feedback = {
        score: 88,
        strengths: ['Clear explanation', 'Good identification of key technical concepts'],
        improvements: ['Include explicit edge case handling', 'Discuss performance complexity trade-offs']
      };
    }

    return {
      success: true,
      isFallback: true,
      companyName: companyName || 'Tech Partner',
      internshipTitle: internshipTitle || 'Software Engineering Intern',
      questions: defaultQuestions,
      evaluation: feedback
    };
  }

  // 6. Project Recommendations
  async recommendProjects(targetRole = 'Backend Developer', currentSkills = []) {
    return {
      success: true,
      recommendedProjects: [
        {
          title: 'Smart Internship Management Portal',
          difficulty: 'INTERMEDIATE',
          technologies: ['React', 'Node.js', 'PostgreSQL', 'REST API'],
          description: 'A full-stack candidate matching portal with dynamic profile completion tracking and AI career coaching.',
          skillsGained: ['Full-stack REST APIs', 'Database Schema Design', 'AI Integration']
        },
        {
          title: 'Distributed Microservice Activity Monitor',
          difficulty: 'ADVANCED',
          technologies: ['Node.js', 'Docker', 'PostgreSQL', 'Redis'],
          description: 'Real-time activity logging system with automated analytics and responsive dashboard visualizers.',
          skillsGained: ['Containerization', 'Performance Optimization', 'System Metrics']
        }
      ]
    };
  }
}

module.exports = new AIService();
