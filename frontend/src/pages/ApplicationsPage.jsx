import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Badge, Skeleton, EmptyState } from '../components/UIComponents';
import { FileText, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/my')
      .then((res) => {
        if (res.data.success) setApplications(res.data.applications || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stages = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];

  const getStageIndex = (status) => {
    if (status === 'REJECTED') return -1;
    return stages.indexOf(status);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <FileText className="w-6 h-6 text-[var(--primary)]" /> My Applications & Status Timeline
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Track real-time evaluation history and interview stages.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-96" />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No Applications Found"
          description="Explore our DSA-recommended internships and submit your first application!"
        />
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const currentIdx = getStageIndex(app.status);
            const isRejected = app.status === 'REJECTED';

            return (
              <Card key={app.id} className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={app.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'}
                      alt={app.company_name}
                      className="w-12 h-12 rounded-xl object-contain border p-1 bg-white"
                    />
                    <div>
                      <h3 className="font-bold text-base">{app.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)]">{app.company_name} • Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--primary)]">Match Score: {app.match_score}%</span>
                    <Badge variant={app.status === 'SELECTED' ? 'success' : isRejected ? 'danger' : 'purple'}>
                      {app.status}
                    </Badge>
                  </div>
                </div>

                {/* Visual Timeline Bar */}
                <div className="py-4 border-t border-b border-[var(--border-color)]">
                  <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider mb-4">Application Lifecycle Stage</p>

                  {isRejected ? (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Application Status: Rejected. Keep applying to other recommended roles!
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2 relative">
                      {stages.map((st, idx) => {
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={st} className="flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                              isCurrent
                                ? 'bg-[var(--primary)] text-white border-[var(--primary)] ring-4 ring-[var(--primary-ring)]'
                                : isDone
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-color)]'
                            }`}>
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`text-[10px] font-bold mt-2 ${isCurrent ? 'text-[var(--primary)]' : isDone ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                              {st.replace('_', ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Status History Log */}
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Evaluation Logs</h4>
                  <div className="space-y-1.5">
                    {app.status_history?.map((h, i) => (
                      <div key={i} className="text-xs text-[var(--text-secondary)] flex items-center justify-between p-2 rounded bg-[var(--bg-main)]">
                        <span>Status set to <strong>{h.status}</strong> by {h.changed_by}: {h.note}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
