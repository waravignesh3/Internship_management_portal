import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, Button, Badge, Skeleton } from '../components/UIComponents';
import { Sparkles, Cpu, Check, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const RecommendationsPage = () => {
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

  if (loading) return <div className="p-8 max-w-6xl mx-auto"><Skeleton className="h-96" /></div>;

  const { recommendations, dsaMeta, student } = data || {};

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-700 via-[var(--primary)] to-indigo-700 text-white shadow-xl">
        <div>
          <Badge variant="purple" className="bg-white/20 text-white border-white/30 mb-2 uppercase font-bold text-[10px]">
            <Cpu className="w-3.5 h-3.5 mr-1" /> Real C++ DSA Engine Active
          </Badge>
          <h1 className="text-2xl font-black">AI & DSA Recommended Internships</h1>
          <p className="text-xs text-white/80 mt-1 max-w-xl">
            Ranked using Priority Queues (Max Heap), O(1) Custom HashMap Indexing, and 6-factor weight calculations.
          </p>
        </div>

        {dsaMeta && (
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-mono text-left border border-white/20 space-y-1">
            <p>Algorithm: {dsaMeta.algorithm}</p>
            <p>Complexity: {dsaMeta.timeComplexity}</p>
            <p>Time: {dsaMeta.executionTimeMs?.toFixed(2)}ms</p>
          </div>
        )}
      </div>

      {/* Profile Overview Pill */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-card)]">
        <div className="text-xs space-y-0.5">
          <span className="text-[var(--text-muted)] font-semibold">Matching Profile: </span>
          <span className="font-bold text-[var(--text-primary)]">{student?.full_name} ({student?.cgpa} CGPA)</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {student?.skills?.map((sk) => (
            <span key={sk} className="px-2 py-0.5 rounded bg-[var(--primary-light)] text-[var(--primary)] font-bold text-[10px]">
              {sk}
            </span>
          ))}
        </div>
      </Card>

      {/* Recommendations Cards List */}
      <div className="space-y-6">
        {recommendations?.map((item) => (
          <Card key={item.internshipId} className="p-6 space-y-4 hover:border-[var(--primary)]/50 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">{item.companyName}</span>
                <h3 className="text-lg font-black text-[var(--text-primary)] mt-0.5">{item.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-black text-[var(--primary)]">{item.matchScore}%</span>
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">DSA Match Index</span>
                </div>
                <Badge variant={item.isEligible ? 'success' : 'danger'}>
                  {item.isEligible ? 'CGPA Eligible' : 'Ineligible'}
                </Badge>
              </div>
            </div>

            {/* Transparent Recommendation Reason */}
            <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs space-y-2">
              <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Why Recommended: {item.explanation}
              </p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-color)]">
                {item.matchedSkills?.map((sk) => (
                  <span key={sk} className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> {sk} (Matched)
                  </span>
                ))}
                {item.missingSkills?.map((sk) => (
                  <span key={sk} className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1">
                    <X className="w-3.5 h-3.5 text-red-500" /> {sk} (Skill Gap)
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to={`/internships/${item.internshipId}`}>
                <Button size="sm">
                  View Internship & Apply <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
