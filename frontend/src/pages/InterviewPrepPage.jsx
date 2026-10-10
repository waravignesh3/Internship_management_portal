import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button, Badge, Input, Skeleton } from '../components/UIComponents';
import { Video, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const InterviewPrepPage = () => {
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    api.post('/ai/interview', { companyName: 'Google', internshipTitle: 'Software Engineering Intern' })
      .then((res) => {
        if (res.data.success) setPrepData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    setEvaluating(true);
    try {
      const res = await api.post('/ai/interview', {
        companyName: 'Google',
        internshipTitle: 'Software Engineering Intern',
        userResponse: userAnswer
      });
      if (res.data.success) {
        setEvaluation(res.data.evaluation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) return <div className="p-8 max-w-4xl mx-auto"><Skeleton className="h-96" /></div>;

  const questions = prepData?.questions || [];
  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Video className="w-6 h-6 text-[var(--primary)]" /> AI Interview Prep & Mock Simulator
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Practice technical, domain-specific, and behavioral interview questions with real-time AI evaluation.
        </p>
      </div>

      {currentQ && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="purple">Question {currentQuestionIdx + 1} of {questions.length} • {currentQ.type}</Badge>
            <span className="text-xs text-[var(--text-muted)]">Company Target: Google</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{currentQ.question}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-2 italic">💡 Guidance: {currentQ.guidance}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Your Answer</label>
            <textarea
              rows={4}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your explanation or response here..."
              className="w-full p-3.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => {
              setUserAnswer('');
              setEvaluation(null);
              setCurrentQuestionIdx((prev) => (prev + 1) % questions.length);
            }}>
              Next Question <RefreshCw className="w-3.5 h-3.5 ml-1" />
            </Button>
            <Button size="sm" onClick={handleEvaluate} loading={evaluating} disabled={!userAnswer.trim()}>
              Evaluate Answer with AI
            </Button>
          </div>

          {/* Evaluation Results Box */}
          {evaluation && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> AI Evaluation Feedback
                </h4>
                <span className="text-sm font-black text-emerald-500">Score: {evaluation.score}/100</span>
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-[var(--text-primary)]">Strengths:</p>
                {evaluation.strengths?.map((s, i) => (
                  <p key={i} className="text-[var(--text-secondary)]">• {s}</p>
                ))}
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-[var(--text-primary)]">Suggested Improvements:</p>
                {evaluation.improvements?.map((s, i) => (
                  <p key={i} className="text-[var(--text-secondary)]">• {s}</p>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
