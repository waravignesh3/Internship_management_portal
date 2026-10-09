import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatCard, Card, Badge, Button, Skeleton } from '../components/UIComponents';
import { Briefcase, Users, CheckCircle2, Award, ArrowRight, Building2, Cpu } from 'lucide-react';

export const CompanyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/companies/dashboard')
      .then((res) => {
        if (res.data.success) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 max-w-6xl mx-auto"><Skeleton className="h-96" /></div>;

  const { company, stats, internships = [], recentApplicants = [] } = data || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-700 to-[var(--primary)] text-white shadow-xl">
        <div className="flex items-center gap-4">
          <img src={company?.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'} alt={company?.company_name} className="w-14 h-14 rounded-2xl object-contain border p-1 bg-white" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Company Recruiter Portal</span>
            <h1 className="text-2xl font-black mt-1">{company?.company_name}</h1>
            <p className="text-xs text-white/80">{company?.industry} • {company?.location}</p>
          </div>
        </div>
        <Link to="/company-internships">
          <Button variant="secondary" className="bg-white text-[var(--primary)] font-bold">
            + Create New Internship
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Active Internships" value={stats?.activeInternships || 0} icon={Briefcase} />
        <StatCard title="Total Applicants" value={stats?.totalApplicants || 0} icon={Users} />
        <StatCard title="Shortlisted" value={stats?.shortlisted || 0} icon={Award} />
        <StatCard title="Selected Interns" value={stats?.selected || 0} icon={CheckCircle2} />
      </div>

      {/* Active Internships & Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[var(--primary)]" /> Published Internships
            </h3>
            <Link to="/company-internships" className="text-xs text-[var(--primary)] hover:underline font-bold">View All</Link>
          </div>
          {internships.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-6 text-center">No active internships published.</p>
          ) : (
            <div className="space-y-3">
              {internships.slice(0, 4).map((i) => (
                <div key={i.id} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{i.title}</h4>
                    <p className="text-[10px] text-[var(--text-muted)]">Seats: {i.available_seats} • Stipend: ₹{i.stipend_monthly?.toLocaleString()}</p>
                  </div>
                  <Badge variant="primary">{i.work_mode}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--primary)]" /> Candidate Applications
            </h3>
            <Link to="/company-applicants" className="text-xs text-[var(--primary)] hover:underline font-bold">Manage Applicants</Link>
          </div>
          {recentApplicants.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-6 text-center">No candidate applications received yet.</p>
          ) : (
            <div className="space-y-3">
              {recentApplicants.slice(0, 4).map((app) => (
                <div key={app.id} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{app.full_name}</h4>
                    <p className="text-[10px] text-[var(--text-muted)]">CGPA: {app.cgpa} • Role: {app.internship_title}</p>
                  </div>
                  <Badge variant="purple">{app.match_score}% Match</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
