import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button, Badge, Skeleton } from '../components/UIComponents';
import { Compass, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

export const CareerAdvisorPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post('/ai/career', { targetCareer: 'Backend Software Engineer' })
      .then((res) => {
        if (res.data.success) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 max-w-4xl mx-auto"><Skeleton className="h-96" /></div>;

  const { targetCareer, currentSkills = [], roadmap = [] } = data || {};

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Compass className="w-6 h-6 text-[var(--primary)]" /> AI Career Advisor
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Personalized career roadmaps and skill trajectory planning.
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white shadow-xl">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
          Target Career Goal
        </span>
        <h2 className="text-2xl font-black mt-2">{targetCareer}</h2>
        <div className="flex items-center gap-2 mt-3 text-xs text-white/80">
          <span>Current Skills:</span>
          {currentSkills.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded bg-white/20 font-bold text-[10px]">
              {s}
            </span>
          ))}
        </div>
      </Card>

      {/* Roadmap Steps */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Recommended Career Progression Roadmap
        </h3>
        <div className="space-y-4">
          {roadmap.map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">{step.phase}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{step.target}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
