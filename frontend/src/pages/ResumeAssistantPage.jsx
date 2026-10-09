import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button, Badge, Skeleton } from '../components/UIComponents';
import { FileCheck, Sparkles, Check, Copy } from 'lucide-react';

export const ResumeAssistantPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post('/ai/resume', {})
      .then((res) => {
        if (res.data.success) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 max-w-4xl mx-auto"><Skeleton className="h-96" /></div>;

  const { tailoredSummary, improvedProjects = [], suggestedKeywords = [] } = data || {};

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-[var(--primary)]" /> AI Resume Tailoring Assistant
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Optimizes your resume summary and project bullet points with high-impact achievement keywords.
        </p>
      </div>

      {/* Summary Box */}
      <Card className="p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Optimized Professional Summary
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
          {tailoredSummary}
        </p>
      </Card>

      {/* Improved Bullet Points */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
          Tailored High-Impact Project Bullet Points
        </h3>
        <div className="space-y-3">
          {improvedProjects.map((bullet, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs text-[var(--text-secondary)] flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{bullet}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Suggested Keywords */}
      <Card className="p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
          Suggested ATS Keywords to Include
        </h3>
        <div className="flex flex-wrap gap-2">
          {suggestedKeywords.map((kw) => (
            <Badge key={kw} variant="primary" className="py-1 px-3 text-xs">
              + {kw}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};
