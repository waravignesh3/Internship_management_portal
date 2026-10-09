const aiService = require('../services/ai/aiService');
const { query } = require('../config/db');

async function chat(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message content is required.' });

    let studentContext = {};
    if (req.user) {
      const s = await query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
      if (s.length > 0) {
        studentContext = s[0];
        const sks = await query('SELECT sk.name FROM student_skills ss JOIN skills sk ON ss.skill_id = sk.id WHERE ss.student_id = $1', [studentContext.id]);
        studentContext.skills = sks.map(k => k.name);
      }
    }

    const result = await aiService.chat(message, studentContext);
    return res.json(result);
  } catch (error) {
    console.error('ai chat error:', error);
    return res.status(500).json({ success: false, error: 'AI chatbot failed.' });
  }
}

async function skillGap(req, res) {
  try {
    const { targetInternshipId } = req.body;

    let studentSkills = ['C++', 'DSA', 'SQL', 'React'];
    if (req.user) {
      const s = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (s.length > 0) {
        const sks = await query('SELECT sk.name FROM student_skills ss JOIN skills sk ON ss.skill_id = sk.id WHERE ss.student_id = $1', [s[0].id]);
        if (sks.length > 0) studentSkills = sks.map(k => k.name);
      }
    }

    let target = { title: 'C++ Systems & Backend Engineer', requiredSkills: ['C++', 'DSA', 'SQL', 'System Design', 'Docker', 'PostgreSQL'] };
    if (targetInternshipId) {
      const iRes = await query('SELECT * FROM internships WHERE id = $1', [targetInternshipId]);
      if (iRes.length > 0) {
        target.title = iRes[0].title;
        const sks = await query('SELECT sk.name FROM internship_skills isk JOIN skills sk ON isk.skill_id = sk.id WHERE isk.internship_id = $1', [targetInternshipId]);
        if (sks.length > 0) target.requiredSkills = sks.map(k => k.name);
      }
    }

    const result = await aiService.analyzeSkillGap(studentSkills, target);
    return res.json(result);
  } catch (error) {
    console.error('ai skillGap error:', error);
    return res.status(500).json({ success: false, error: 'Skill gap analysis failed.' });
  }
}

async function resumeAssistant(req, res) {
  try {
    const { targetInternshipId } = req.body;
    let studentProfile = { bio: 'Motivated Computer Science student skilled in C++, DSA and Web development.', skills: ['C++', 'DSA', 'React', 'SQL'], cgpa: 8.8 };
    let targetInternship = { title: 'Systems Developer', requiredSkills: ['C++', 'DSA', 'Docker', 'System Design'] };

    if (req.user) {
      const s = await query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
      if (s.length > 0) studentProfile = s[0];
    }

    if (targetInternshipId) {
      const iRes = await query('SELECT * FROM internships WHERE id = $1', [targetInternshipId]);
      if (iRes.length > 0) targetInternship = iRes[0];
    }

    const result = await aiService.improveResume(studentProfile, targetInternship);
    return res.json(result);
  } catch (error) {
    console.error('ai resume error:', error);
    return res.status(500).json({ success: false, error: 'Resume assistant failed.' });
  }
}

async function careerAdvisor(req, res) {
  try {
    const { targetCareer } = req.body;
    let studentProfile = { skills: ['C++', 'DSA', 'SQL'] };
    if (req.user) {
      const s = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (s.length > 0) {
        const sks = await query('SELECT sk.name FROM student_skills ss JOIN skills sk ON ss.skill_id = sk.id WHERE ss.student_id = $1', [s[0].id]);
        studentProfile.skills = sks.map(k => k.name);
      }
    }

    const result = await aiService.getCareerAdvice(studentProfile, targetCareer || 'Backend Engineer');
    return res.json(result);
  } catch (error) {
    console.error('ai career error:', error);
    return res.status(500).json({ success: false, error: 'Career advisor failed.' });
  }
}

async function interviewPrep(req, res) {
  try {
    const { companyName, internshipTitle, userResponse } = req.body;
    const result = await aiService.generateInterviewPrep(companyName, internshipTitle, userResponse);
    return res.json(result);
  } catch (error) {
    console.error('ai interview prep error:', error);
    return res.status(500).json({ success: false, error: 'Interview prep failed.' });
  }
}

async function projectRecommendations(req, res) {
  try {
    const { targetRole } = req.body;
    const result = await aiService.recommendProjects(targetRole || 'Full Stack Engineer');
    return res.json(result);
  } catch (error) {
    console.error('ai projects error:', error);
    return res.status(500).json({ success: false, error: 'Project recommendation failed.' });
  }
}

module.exports = {
  chat,
  skillGap,
  resumeAssistant,
  careerAdvisor,
  interviewPrep,
  projectRecommendations
};
