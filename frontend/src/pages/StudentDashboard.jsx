import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatCard, Card, Badge, Button, Skeleton } from '../components/UIComponents';
import {
  Briefcase,
  FileCheck,
  Award,
  Bookmark,
  Sparkles,
  Calendar,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Cpu,
  Check,
  X
} from 'lucide-react';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/dashboard')
      .then((res) => {
        if (res.data.success) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { stats, student, upcomingInterviews, recentApplications, recommendations, dsaMeta } = data || {};

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Welcome back, {student?.full_name}! 👋</h1>
          <p className="text-xs text-white/80 mt-1">
            CGPA: <span className="font-bold">{student?.cgpa}</span> | Department: <span className="font-bold">{student?.department}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/recommendations">
            <Button variant="secondary" size="sm" className="bg-white text-[var(--primary)] hover:bg-slate-100 font-bold shadow-md">
              <Sparkles className="w-4 h-4 fill-current" /> View Recommendations
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={stats?.totalApplications || 0} icon={FileCheck} />
        <StatCard title="Shortlisted" value={stats?.shortlisted || 0} icon={Award} />
        <StatCard title="Selected" value={stats?.selected || 0} icon={TrendingUp} />
        <StatCard title="Saved Internships" value={stats?.savedInternships || 0} icon={Bookmark} />
      </div>

      {/* Top Recommended Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--primary)]" /> Recommended For You
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Personalized opportunities based on your skills, preferences, and qualifications
            </p>
          </div>
          <Badge variant="purple" className="text-[10px] font-semibold">
            Tailored Opportunities
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations?.slice(0, 2).map((item) => (
            <Card key={item.internshipId} hover className="relative flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">{item.title}</h3>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">{item.companyName}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-[var(--primary)]">{item.matchScore}%</span>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Match Score</span>
                </div>
              </div>

              {/* Matching Explanation Box */}
              <div className="mt-4 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs space-y-2">
                <p className="font-semibold text-[var(--text-secondary)]">{item.explanation}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.matchedSkills?.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                      <Check className="w-3 h-3" /> {s}
                    </span>
                  ))}
                  {item.missingSkills?.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-[10px] flex items-center gap-1">
                      <X className="w-3 h-3" /> Missing: {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <Badge variant={item.isEligible ? 'success' : 'danger'}>
                  {item.isEligible ? '✓ CGPA Eligible' : 'Ineligible'}
                </Badge>
                <Link to={`/internships/${item.internshipId}`}>
                  <Button size="sm">
                    View Details & Apply <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Grid: Upcoming Interviews & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews */}
        <Card>
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-[var(--primary)]" /> Upcoming Interviews
          </h3>
          {upcomingInterviews?.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-6 text-center">No upcoming interviews scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews?.map((iv) => (
                <div key={iv.id} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold">{iv.internship_title}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)]">{iv.company_name} • {iv.interview_type}</p>
                    <p className="text-[10px] text-[var(--primary)] font-semibold mt-1">
                      📅 {new Date(iv.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <a href={iv.location_or_link} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">Join Link</Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Applications */}
        <Card>
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <FileCheck className="w-4 h-4 text-[var(--primary)]" /> Recent Applications
          </h3>
          {recentApplications?.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-6 text-center">You haven't applied to any internships yet.</p>
          ) : (
            <div className="space-y-3">
              {recentApplications?.map((app) => (
                <div key={app.id} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold">{app.title}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)]">{app.company_name} • Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={app.status === 'SELECTED' ? 'success' : app.status === 'SHORTLISTED' ? 'purple' : 'info'}>
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
