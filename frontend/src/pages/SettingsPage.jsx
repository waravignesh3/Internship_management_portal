import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, Button, Input, Select, Badge } from '../components/UIComponents';
import {
  Settings,
  Sun,
  Moon,
  Palette,
  User,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  GraduationCap,
  FileText,
  Briefcase,
  Code,
  Image,
  FolderGit2,
  AlignLeft,
  Loader2
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, theme, setTheme, accent, setAccent, addToast, updateProfileState, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completionDetails, setCompletionDetails] = useState(user?.profile?.completionDetails || null);

  // Profile Form States
  const [fullName, setFullName] = useState(user?.profile?.full_name || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [avatar, setAvatar] = useState(user?.profile?.avatar || '');
  const [collegeName, setCollegeName] = useState(user?.profile?.college_name || '');
  const [department, setDepartment] = useState(user?.profile?.department || '');
  const [cgpa, setCgpa] = useState(user?.profile?.cgpa !== undefined && user?.profile?.cgpa !== null ? String(user.profile.cgpa) : '');
  const [graduationYear, setGraduationYear] = useState(user?.profile?.graduation_year !== undefined && user?.profile?.graduation_year !== null ? String(user.profile.graduation_year) : '2026');
  const [preferredDomain, setPreferredDomain] = useState(user?.profile?.preferred_domain || '');
  const [preferredLocations, setPreferredLocations] = useState(user?.profile?.preferred_locations || '');
  const [preferredWorkMode, setPreferredWorkMode] = useState(user?.profile?.preferred_work_mode || 'ANY');
  const [minStipend, setMinStipend] = useState(user?.profile?.min_stipend !== undefined && user?.profile?.min_stipend !== null ? String(user.profile.min_stipend) : '0');
  const [resumeUrl, setResumeUrl] = useState(user?.profile?.resume_url || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [skills, setSkills] = useState(
    Array.isArray(user?.profile?.skills)
      ? user.profile.skills.map((s) => (typeof s === 'string' ? s : s.name || '')).filter(Boolean).join(', ')
      : ''
  );

  // Field References for Action Scrolling
  const fieldRefs = {
    full_name: useRef(null),
    phone: useRef(null),
    avatar: useRef(null),
    college_name: useRef(null),
    department: useRef(null),
    cgpa: useRef(null),
    graduation_year: useRef(null),
    preferred_domain: useRef(null),
    preferred_locations: useRef(null),
    resume_url: useRef(null),
    bio: useRef(null),
    skills: useRef(null)
  };

  const accents = [
    { name: 'blue', color: '#2563eb' },
    { name: 'cyan', color: '#06b6d4' },
    { name: 'purple', color: '#9333ea' },
    { name: 'green', color: '#10b981' },
    { name: 'orange', color: '#f97316' },
    { name: 'red', color: '#ef4444' }
  ];

  // Fetch complete profile on mount
  useEffect(() => {
    if (user?.role === 'STUDENT') {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const res = await api.get('/students/profile');
          if (res.data.success) {
            const p = res.data.student;
            setCompletionDetails(res.data.completionDetails);
            setFullName(p.full_name || '');
            setPhone(p.phone || '');
            setAvatar(p.avatar || '');
            setCollegeName(p.college_name || '');
            setDepartment(p.department || '');
            setCgpa(p.cgpa !== undefined && p.cgpa !== null ? String(p.cgpa) : '');
            setGraduationYear(p.graduation_year !== undefined && p.graduation_year !== null ? String(p.graduation_year) : '2026');
            setPreferredDomain(p.preferred_domain || '');
            setPreferredLocations(p.preferred_locations || '');
            setPreferredWorkMode(p.preferred_work_mode || 'ANY');
            setMinStipend(p.min_stipend !== undefined && p.min_stipend !== null ? String(p.min_stipend) : '0');
            setResumeUrl(p.resume_url || '');
            setBio(p.bio || '');
            if (Array.isArray(p.skills)) {
              setSkills(p.skills.map((s) => (typeof s === 'string' ? s : s.name || '')).filter(Boolean).join(', '));
            }
          }
        } catch (err) {
          console.warn('Could not fetch student profile details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user?.role]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const payload = {
        full_name: fullName,
        phone,
        avatar,
        college_name: collegeName,
        department,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        graduation_year: graduationYear ? parseInt(graduationYear, 10) : null,
        preferred_domain: preferredDomain,
        preferred_locations: preferredLocations,
        preferred_work_mode: preferredWorkMode,
        min_stipend: minStipend ? parseInt(minStipend, 10) : 0,
        resume_url: resumeUrl,
        bio,
        skills: skillsArray
      };

      const res = await api.put('/students/profile', payload);
      if (res.data.success) {
        addToast('Profile updated successfully!', 'success');
        if (res.data.completionDetails) {
          setCompletionDetails(res.data.completionDetails);
        }
        if (res.data.student) {
          updateProfileState({
            ...res.data.student,
            profile_completion: res.data.profileCompletion,
            completionDetails: res.data.completionDetails
          });
        }
        await refreshUser();
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleActionClick = (targetField) => {
    const ref = fieldRefs[targetField];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ref.current.focus?.();
    }
  };

  const getSectionIcon = (id) => {
    switch (id) {
      case 'personal': return <User className="w-4 h-4 text-[var(--primary)]" />;
      case 'avatar': return <Image className="w-4 h-4 text-purple-500" />;
      case 'education': return <GraduationCap className="w-4 h-4 text-indigo-500" />;
      case 'skills': return <Code className="w-4 h-4 text-emerald-500" />;
      case 'resume': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'bio': return <AlignLeft className="w-4 h-4 text-amber-500" />;
      case 'career': return <Briefcase className="w-4 h-4 text-cyan-500" />;
      case 'projects': return <FolderGit2 className="w-4 h-4 text-rose-500" />;
      default: return <Sparkles className="w-4 h-4 text-[var(--primary)]" />;
    }
  };

  const currentPercentage = completionDetails?.percentage ?? (user?.profile?.profile_completion || 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Settings className="w-6 h-6 text-[var(--primary)]" /> Account & System Settings
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Configure profile information, complete missing sections, and customize theme preferences.
        </p>
      </div>

      {/* TASK 1: COMPLETE YOUR PROFILE CHECKLIST SECTION */}
      {user?.role === 'STUDENT' && (
        <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" /> Complete Your Profile
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl">
                Complete your profile to showcase your skills, highlight your experience, and discover internship opportunities that match your career goals.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-[var(--primary-light)] p-3 rounded-xl border border-[var(--primary)]/20 shrink-0">
              <div className="text-right">
                <span className="text-2xl font-black text-[var(--primary)]">{currentPercentage}%</span>
                <span className="block text-[9px] uppercase font-bold text-[var(--text-muted)]">Completion</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin-slow flex items-center justify-center font-bold text-xs text-[var(--primary)]">
                {currentPercentage}%
              </div>
            </div>
          </div>

          {/* Animated Progress Bar & Dynamic Message */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 border border-[var(--border-color)]">
              <div
                className="h-full bg-gradient-to-r from-[var(--primary)] via-indigo-500 to-purple-600 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${currentPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {completionDetails?.dynamicMessage || (currentPercentage === 100
                  ? 'Your profile is complete! Keep your information up to date.'
                  : "Complete your profile to increase your internship match accuracy!")}
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                {completionDetails?.completedCount ?? 0} of {completionDetails?.totalCount ?? 8} Sections Ready
              </span>
            </div>
          </div>

          {/* Success Banner if 100% */}
          {currentPercentage === 100 && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-bold">Congratulations! Your profile is 100% complete.</p>
                <p className="text-[11px] opacity-90">Recruiters can now view your full profile and match scores.</p>
              </div>
            </div>
          )}

          {/* Checklist Grid */}
          {loading ? (
            <div className="flex items-center justify-center p-8 text-xs text-[var(--text-muted)] gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" /> Loading profile completion checklist...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(completionDetails?.sections || [
                { id: 'personal', title: 'Personal Information', description: 'Add full name and phone', actionLabel: 'Edit Personal Info', targetField: 'full_name', isComplete: Boolean(fullName && phone) },
                { id: 'avatar', title: 'Profile Photo', description: 'Add profile photo or avatar URL', actionLabel: 'Add Photo', targetField: 'avatar', isComplete: Boolean(avatar) },
                { id: 'education', title: 'Education Details', description: 'College, department, CGPA & year', actionLabel: 'Complete Education', targetField: 'college_name', isComplete: Boolean(collegeName && department && cgpa) },
                { id: 'skills', title: 'Technical Skills', description: 'Add your programming & tech skills', actionLabel: 'Add Skills', targetField: 'skills', isComplete: Boolean(skills) },
                { id: 'resume', title: 'Resume Document', description: 'Upload resume link or PDF', actionLabel: 'Upload Resume', targetField: 'resume_url', isComplete: Boolean(resumeUrl) },
                { id: 'bio', title: 'About & Bio Summary', description: 'Write concise career summary', actionLabel: 'Write Bio', targetField: 'bio', isComplete: Boolean(bio && bio.length >= 10) },
                { id: 'career', title: 'Career Preferences', description: 'Preferred domain & locations', actionLabel: 'Set Preferences', targetField: 'preferred_domain', isComplete: Boolean(preferredDomain && preferredLocations) },
                { id: 'projects', title: 'Projects & Portfolio', description: 'Highlight technical projects', actionLabel: 'Add Projects', targetField: 'bio', isComplete: false }
              ]).map((section) => (
                <div
                  key={section.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    section.isComplete
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shrink-0">
                      {getSectionIcon(section.id)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs text-[var(--text-primary)] truncate">{section.title}</h4>
                        {section.isComplete ? (
                          <Badge variant="success" className="text-[9px] py-0 px-1.5 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Done
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[9px] py-0 px-1.5 flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" /> Missing
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{section.description}</p>
                    </div>
                  </div>

                  {!section.isComplete && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(section.targetField)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors shrink-0 flex items-center gap-1"
                    >
                      {section.actionLabel} <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Visual Theme Customizer */}
      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Palette className="w-4 h-4 text-[var(--primary)]" /> Visual Theme Customization
        </h3>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Theme Mode</label>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 text-xs font-bold rounded-xl border ${
                theme === 'light' ? 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]' : 'border-[var(--border-color)]'
              }`}
            >
              <Sun className="w-4 h-4" /> Light Mode
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 text-xs font-bold rounded-xl border ${
                theme === 'dark' ? 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]' : 'border-[var(--border-color)]'
              }`}
            >
              <Moon className="w-4 h-4" /> Dark Mode
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Accent Color</label>
          <div className="grid grid-cols-6 gap-3">
            {accents.map((acc) => (
              <button
                key={acc.name}
                onClick={() => setAccent(acc.name)}
                className="h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
                style={{ backgroundColor: acc.color }}
              >
                {accent === acc.name && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Complete Profile Form for Students */}
      {user?.role === 'STUDENT' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--primary)]" /> Comprehensive Profile Form
            </h3>
            <span className="text-[10px] text-[var(--text-muted)]">All fields sync directly to database</span>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-6">
            {/* Section 1: Basic & Contact Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">1. Basic & Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div ref={fieldRefs.full_name}>
                  <Input
                    label="Full Name *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    required
                  />
                </div>
                <div ref={fieldRefs.phone}>
                  <Input
                    label="Phone Number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 555-019-2831"
                  />
                </div>
              </div>
              <div ref={fieldRefs.avatar}>
                <Input
                  label="Profile Avatar Image URL"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            {/* Section 2: Education */}
            <div className="space-y-4 border-t border-[var(--border-color)] pt-4">
              <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">2. Education Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div ref={fieldRefs.college_name}>
                  <Input
                    label="College / University Name *"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. Stanford University"
                  />
                </div>
                <div ref={fieldRefs.department}>
                  <Input
                    label="Department / Major *"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div ref={fieldRefs.cgpa}>
                  <Input
                    label="CGPA (0.00 - 10.00) *"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="e.g. 8.75"
                  />
                </div>
                <div ref={fieldRefs.graduation_year}>
                  <Input
                    label="Graduation Year *"
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2026"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Skills & Resume */}
            <div className="space-y-4 border-t border-[var(--border-color)] pt-4">
              <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">3. Technical Skills & Resume</h4>
              <div ref={fieldRefs.skills}>
                <Input
                  label="Technical Skills (Comma separated) *"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, PostgreSQL, TypeScript, Docker"
                />
              </div>
              <div ref={fieldRefs.resume_url}>
                <Input
                  label="Resume PDF URL or Portfolio Link *"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/your-resume.pdf"
                />
              </div>
            </div>

            {/* Section 4: Preferences & Summary */}
            <div className="space-y-4 border-t border-[var(--border-color)] pt-4">
              <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">4. Career Preferences & Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div ref={fieldRefs.preferred_domain}>
                  <Input
                    label="Preferred Domain *"
                    value={preferredDomain}
                    onChange={(e) => setPreferredDomain(e.target.value)}
                    placeholder="e.g. Software Engineering"
                  />
                </div>
                <div ref={fieldRefs.preferred_locations}>
                  <Input
                    label="Preferred Locations *"
                    value={preferredLocations}
                    onChange={(e) => setPreferredLocations(e.target.value)}
                    placeholder="e.g. San Francisco, Remote, New York"
                  />
                </div>
                <div>
                  <Select
                    label="Preferred Work Mode"
                    value={preferredWorkMode}
                    onChange={(e) => setPreferredWorkMode(e.target.value)}
                    options={[
                      { value: 'ANY', label: 'Any Work Mode' },
                      { value: 'REMOTE', label: 'Remote Only' },
                      { value: 'HYBRID', label: 'Hybrid' },
                      { value: 'ON_SITE', label: 'On-Site' }
                    ]}
                  />
                </div>
              </div>

              <div ref={fieldRefs.bio} className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">
                  Professional Bio / About Summary *
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your technical background, key accomplishments, and career aspirations..."
                  className="w-full p-3.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-ring)]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" loading={saving} className="px-8 shadow-md">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
