import React from 'react';
import { Card, Badge, StatCard } from '../components/UIComponents';
import { BrainCircuit, Bot, FileCheck, Target, Video, ShieldCheck } from 'lucide-react';

export const AdminAIInsightsPage = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-purple-500" /> AI Insights & Usage Monitor
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Monitor backend AI provider usage, chatbot requests, and rule-based fallback performance.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total AI Requests" value="1,420" icon={BrainCircuit} />
        <StatCard title="Chatbot Queries" value="890" icon={Bot} />
        <StatCard title="Resume Tailors" value="310" icon={FileCheck} />
        <StatCard title="Interview Preps" value="220" icon={Video} />
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> AI Privacy & Data Security Audit
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          All AI requests are funneled through the backend abstraction layer. No JWT tokens, passwords, database credentials, or private cross-student data are ever transmitted to external AI providers.
        </p>
      </Card>
    </div>
  );
};
