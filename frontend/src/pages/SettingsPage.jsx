import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, Button, Input, Select, Badge } from '../components/UIComponents';
import { Settings, Sun, Moon, Palette, User, Check } from 'lucide-react';

export const SettingsPage = () => {
  const { user, theme, setTheme, accent, setAccent, addToast } = useAuth();

  const [fullName, setFullName] = useState(user?.profile?.full_name || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [cgpa, setCgpa] = useState(user?.profile?.cgpa || '8.5');
  const [skills, setSkills] = useState(user?.profile?.skills ? user.profile.skills.map((s) => s.name || s).join(', ') : 'C++, DSA, SQL, React, Node.js');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const accents = [
    { name: 'blue', color: '#2563eb' },
    { name: 'cyan', color: '#06b6d4' },
    { name: 'purple', color: '#9333ea' },
    { name: 'green', color: '#10b981' },
    { name: 'orange', color: '#f97316' },
    { name: 'red', color: '#ef4444' }
  ];

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/students/profile', {
        full_name: fullName,
        phone,
        cgpa: parseFloat(cgpa),
        bio,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean)
      });
      if (res.data.success) {
        addToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      addToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Settings className="w-6 h-6 text-[var(--primary)]" /> Account & System Settings
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Configure profile information, theme preferences, and color accents.</p>
      </div>

      {/* Profile Completion Card (Requirement 63) */}
      {user?.role === 'STUDENT' && (
        <Card className="p-6 bg-[var(--primary-light)] border-[var(--primary)]/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--primary)]">Profile Completion Status</h3>
            <span className="text-xl font-black text-[var(--primary)]">{user?.profile?.profile_completion || 85}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-[var(--primary)] transition-all" style={{ width: `${user?.profile?.profile_completion || 85}%` }} />
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Complete your profile to increase your C++ DSA matching accuracy!</p>
        </Card>
      )}

      {/* Theme & Accent Customizer */}
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

      {/* Profile Form for Students */}
      {user?.role === 'STUDENT' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--primary)]" /> Student Profile Details
          </h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="CGPA (0 - 10.0)" type="number" step="0.01" value={cgpa} onChange={(e) => setCgpa(e.target.value)} required />
              <Input label="Skills (Comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Bio / Summary</label>
              <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)]" />
            </div>

            <Button type="submit" loading={saving}>Save Profile Changes</Button>
          </form>
        </Card>
      )}
    </div>
  );
};
