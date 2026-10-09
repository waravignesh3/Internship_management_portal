import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button, Badge, Skeleton } from '../components/UIComponents';
import { Target, CheckCircle2, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';

export const SkillGapPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post('/ai/skill-gap', {})
      .then((res) => {
        if (res.data.success) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 max-w-4xl mx-auto"><Skeleton className="h-96" /></div>;

  const { possessed = [], missing = [], suggestions = [] } = data || {};

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Target className="w-6 h-6 text-[var(--primary)]" /> AI Skill Gap Analyzer
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Identifies missing skills for your target internship role and generates a prioritized learning path.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Possessed Skills */}
        <Card className="p-6">
          <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-500 mb-4">
            <CheckCircle2 className="w-4 h-4" /> Possessed Skills ({possessed.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {possessed.map((sk) => (
              <Badge key={sk} variant="success" className="py-1 px-3 text-xs font-bold">
                ✓ {sk}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Missing Skills */}
        <Card className="p-6">
          <h3 className="text-sm font-bold flex items-center gap-2 text-red-500 mb-4">
            <AlertTriangle className="w-4 h-4" /> Missing / Skill Gaps ({missing.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missing.map((sk) => (
              <Badge key={sk} variant="danger" className="py-1 px-3 text-xs font-bold">
                ! {sk}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Suggested Learning Order */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--primary)]" /> Priority Learning Order Roadmap
        </h3>
        <div className="space-y-3">
          {suggestions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center">
                  #{item.learningOrder || idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{item.skill}</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{item.reason}</p>
                </div>
              </div>
              <Badge variant={item.priority === 'HIGH' ? 'danger' : item.priority === 'MEDIUM' ? 'warning' : 'info'}>
                Priority: {item.priority}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
