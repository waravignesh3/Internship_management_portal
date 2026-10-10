import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatCard, Card, Badge, Button, Skeleton } from '../components/UIComponents';
import { Shield, Users, Building2, Briefcase, AlertTriangle, Cpu, BrainCircuit, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = () => {
  const { addToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = () => {
    api.get('/admin/dashboard')
      .then((res) => {
        if (res.data.success) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId, currentActive) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`, { isActive: !currentActive });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchAdminData();
      }
    } catch (err) {
      addToast('Failed to change user status.', 'error');
    }
  };

  if (loading) return <div className="p-8 max-w-7xl mx-auto"><Skeleton className="h-96" /></div>;

  const { stats, atRiskStudents = [], topSkills = [], dsaHealth } = data || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-slate-800">
        <div>
          <Badge variant="purple" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-2 uppercase font-bold text-[10px]">
            <Shield className="w-3.5 h-3.5 mr-1" /> College Administrator Ecosystem Dashboard
          </Badge>
          <h1 className="text-2xl font-black">InternHub Global Governance</h1>
          <p className="text-xs text-slate-300 mt-1">Real-time system statistics, at-risk student intervention, and matching engine monitoring.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin-dsa">
            <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <Cpu className="w-4 h-4 mr-1" /> Matching Engine Inspector
            </Button>
          </Link>
          <Link to="/admin-analytics">
            <Button variant="outline" size="sm" className="text-white border-slate-700 hover:bg-slate-800">
              Analytics & Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} />
        <StatCard title="Company Partners" value={stats?.totalCompanies || 0} icon={Building2} />
        <StatCard title="Published Internships" value={stats?.totalInternships || 0} icon={Briefcase} />
        <StatCard title="Selections Rate" value={`${stats?.selectionRate || 0}%`} icon={Award} />
      </div>

      {/* At-Risk Student Detection (Requirement 29) */}
      <Card className="p-6 space-y-4 border-l-4 border-l-red-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <h3 className="font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
              At-Risk Student Early Intervention ({atRiskStudents.length} Needs Attention)
            </h3>
          </div>
          <Badge variant="danger">High Priority Intervention</Badge>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Flags eligible students (CGPA ≥ 6.0) with fewer than 2 submitted applications or repeatedly rejected status.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {atRiskStudents.map((st) => (
            <div key={st.id} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-[var(--text-primary)]">{st.full_name} ({st.cgpa} CGPA)</h4>
                <p className="text-[10px] text-[var(--text-secondary)]">{st.email} • {st.college_name}</p>
                <p className="text-[10px] font-bold text-red-500 mt-1">
                  Applications: {st.app_count} | Rejections: {st.rej_count}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => addToast(`Intervention notification sent to ${st.full_name}`, 'info')}>
                Send Alert
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Infrastructure & AI Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-500" /> High-Performance Matching Engine
          </h3>
          <div className="p-4 rounded-xl bg-[var(--bg-main)] text-xs space-y-2 font-mono">
            <div className="flex justify-between"><span>Status:</span><span className="text-emerald-500 font-bold">{dsaHealth?.status}</span></div>
            <div className="flex justify-between"><span>Endpoint:</span><span>{dsaHealth?.url}</span></div>
            <div className="flex justify-between"><span>Core Services:</span><span>Profile Indexing, Candidate Ranking, Seat Allocation</span></div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-500" /> AI Service Abstraction
          </h3>
          <div className="p-4 rounded-xl bg-[var(--bg-main)] text-xs space-y-2 font-mono">
            <div className="flex justify-between"><span>Provider:</span><span className="font-bold uppercase text-purple-400">{data?.aiProvider}</span></div>
            <div className="flex justify-between"><span>API Key Configured:</span><span className={data?.aiConfigured ? 'text-emerald-500' : 'text-amber-500'}>{data?.aiConfigured ? 'YES (Active)' : 'NO (Using Rule-Based Fallback)'}</span></div>
            <div className="flex justify-between"><span>Fallback Mode:</span><span className="text-emerald-500">Rule-Based Engine Ready</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
};
