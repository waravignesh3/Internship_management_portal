/**
 * Utility to calculate profile completion percentage and missing checklist items
 * based on actual database fields in the students table and related records.
 */

function calculateProfileCompletion(student = {}, skills = [], projects = []) {
  const sections = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Add your full name and phone number',
      actionLabel: 'Edit Personal Info',
      targetField: 'full_name',
      isComplete: Boolean(
        student.full_name &&
        typeof student.full_name === 'string' &&
        student.full_name.trim().length > 0 &&
        student.phone &&
        typeof student.phone === 'string' &&
        student.phone.trim().length >= 7
      )
    },
    {
      id: 'avatar',
      title: 'Profile Photo',
      description: 'Add a profile photo or avatar URL',
      actionLabel: 'Add Photo',
      targetField: 'avatar',
      isComplete: Boolean(
        student.avatar &&
        typeof student.avatar === 'string' &&
        student.avatar.trim().length > 0 &&
        !student.avatar.includes('placeholder')
      )
    },
    {
      id: 'education',
      title: 'Education Details',
      description: 'Provide college name, department, CGPA, and graduation year',
      actionLabel: 'Complete Education',
      targetField: 'college_name',
      isComplete: Boolean(
        student.college_name &&
        typeof student.college_name === 'string' &&
        student.college_name.trim().length > 0 &&
        student.department &&
        typeof student.department === 'string' &&
        student.department.trim().length > 0 &&
        student.cgpa !== null &&
        student.cgpa !== undefined &&
        Number(student.cgpa) > 0 &&
        Number(student.cgpa) <= 10.0 &&
        student.graduation_year &&
        Number(student.graduation_year) >= 2000
      )
    },
    {
      id: 'skills',
      title: 'Technical Skills',
      description: 'Add at least one relevant skill to your profile',
      actionLabel: 'Add Skills',
      targetField: 'skills',
      isComplete: Boolean(
        (Array.isArray(skills) && skills.length > 0) ||
        (Array.isArray(student.skills) && student.skills.length > 0)
      )
    },
    {
      id: 'resume',
      title: 'Resume Document',
      description: 'Upload your resume or provide a valid resume URL',
      actionLabel: 'Upload Resume',
      targetField: 'resume_url',
      isComplete: Boolean(
        student.resume_url &&
        typeof student.resume_url === 'string' &&
        student.resume_url.trim().length > 0
      )
    },
    {
      id: 'bio',
      title: 'About & Bio Summary',
      description: 'Write a concise professional summary (at least 10 characters)',
      actionLabel: 'Write Bio',
      targetField: 'bio',
      isComplete: Boolean(
        student.bio &&
        typeof student.bio === 'string' &&
        student.bio.trim().length >= 10
      )
    },
    {
      id: 'career',
      title: 'Career Preferences',
      description: 'Set your preferred internship domain and work location',
      actionLabel: 'Set Preferences',
      targetField: 'preferred_domain',
      isComplete: Boolean(
        student.preferred_domain &&
        typeof student.preferred_domain === 'string' &&
        student.preferred_domain.trim().length > 0 &&
        student.preferred_locations &&
        typeof student.preferred_locations === 'string' &&
        student.preferred_locations.trim().length > 0
      )
    },
    {
      id: 'projects',
      title: 'Projects & Experience',
      description: 'Highlight your technical projects or practical experience',
      actionLabel: 'Add Projects',
      targetField: 'projects',
      isComplete: Boolean(
        (Array.isArray(projects) && projects.length > 0) ||
        (Array.isArray(student.projects) && student.projects.length > 0) ||
        (student.has_projects === true)
      )
    }
  ];

  const completedSections = sections.filter(s => s.isComplete);
  const missingSections = sections.filter(s => !s.isComplete);
  const totalCount = sections.length;
  const completedCount = completedSections.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  let dynamicMessage = '';
  if (percentage === 100) {
    dynamicMessage = 'Your profile is complete! Keep your information up to date.';
  } else if (percentage >= 75) {
    const missingNames = missingSections.map(s => s.title.toLowerCase()).join(' and ');
    dynamicMessage = `You're almost there! Add your remaining ${missingNames}.`;
  } else if (percentage >= 50) {
    dynamicMessage = 'Great progress! Complete your education and skills to improve your profile.';
  } else {
    dynamicMessage = 'Complete your profile to showcase your skills and discover matching internship opportunities.';
  }

  return {
    percentage,
    completedCount,
    totalCount,
    dynamicMessage,
    sections,
    completedSections: completedSections.map(s => s.id),
    missingSections: missingSections.map(s => s.id)
  };
}

module.exports = {
  calculateProfileCompletion
};
