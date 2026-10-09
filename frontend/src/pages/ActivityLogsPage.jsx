import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Skeleton } from '../components/UIComponents';
import { Activity } from 'lucide-react';

export const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/activity-logs')
      .then((res) => {
        if (res.data.success) setLogs(res.data.logs || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 max-w-5xl mx-auto"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Activity className="w-6 h-6 text-[var(--primary)]" /> System Audit Activity Logs
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Real-time trail of authentication and platform events.</p>
      </div>

      <Card className="p-6">
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[var(--primary)] uppercase tracking-wider">{log.action}</span>
                <p className="text-[var(--text-secondary)] mt-0.5">{log.details}</p>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">{new Date(log.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
