import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button, Badge, Skeleton } from '../components/UIComponents';
import { Cpu, Play, CheckCircle2, Sparkles, Code2, Database } from 'lucide-react';

export const AdminDSAEnginePage = () => {
  const [stats, setStats] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api.get('/dsa/stats')
      .then((res) => {
        if (res.data.success) setStats(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleTestRun = async (endpoint) => {
    setRunning(true);
    try {
      let res;
      if (endpoint === 'match') {
        res = await api.post('/dsa/match', {
          studentProfile: { full_name: 'Aarav Sharma', cgpa: 9.15, skills: ['C++', 'DSA', 'SQL', 'React', 'Node.js'], preferred_domain: 'Software Engineering', preferred_work_mode: 'HYBRID' }
        });
      } else if (endpoint === 'graph') {
        res = await api.post('/dsa/graph', { skill: 'C++' });
      } else if (endpoint === 'allocate') {
        res = await api.post('/dsa/allocate', { totalSeats: 3 });
      }
      if (res.data) setTestResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="p-8 max-w-6xl mx-auto"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800">
        <div>
          <Badge variant="purple" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-2 uppercase font-bold text-[10px]">
            <Cpu className="w-3.5 h-3.5 mr-1" /> College Viva & Technical Demonstration Page
          </Badge>
          <h1 className="text-2xl font-black">C++ Data Structures & Algorithms Engine</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live interactive inspector for custom C++ HashMaps, Skill Graph BFS/DFS, Max Heaps, and Greedy Seat Allocators.
          </p>
        </div>
      </div>

      {/* Interactive Test Trigger Buttons */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-500 fill-current" /> Live Algorithm Execution Test Bench
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleTestRun('match')} loading={running} className="bg-blue-600 hover:bg-blue-700">
            Run 6-Factor Matching (Max Heap + HashMap)
          </Button>
          <Button onClick={() => handleTestRun('graph')} loading={running} className="bg-purple-600 hover:bg-purple-700">
            Run Skill Graph (BFS & DFS Traversal)
          </Button>
          <Button onClick={() => handleTestRun('allocate')} loading={running} className="bg-emerald-600 hover:bg-emerald-700">
            Run Greedy Seat Allocation
          </Button>
        </div>
      </Card>

      {/* Test Execution Output Box */}
      {testResult && (
        <Card className="p-6 bg-slate-900 text-slate-100 border-slate-800 space-y-4 shadow-2xl animate-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
              <Code2 className="w-4 h-4" /> Algorithm Output JSON
            </h4>
            <Badge variant="primary" className="font-mono text-[10px]">{testResult.algorithm}</Badge>
          </div>
          <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto max-h-96">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </Card>
      )}

      {/* Algorithms Specification Matrix */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Implemented C++ Algorithms Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 space-y-2">
            <Badge variant="primary">HASH MAP</Badge>
            <h4 className="font-bold text-sm">O(1) Custom HashMap Table</h4>
            <p className="text-xs text-[var(--text-secondary)]">Used for instant O(1) average lookup of Student IDs, Skill IDs, Company IDs, and Internship specifications.</p>
            <p className="text-[10px] font-mono text-[var(--text-muted)]">Time: O(1) Avg | Space: O(N)</p>
          </Card>

          <Card className="p-5 space-y-2">
            <Badge variant="purple">SKILL GRAPH</Badge>
            <h4 className="font-bold text-sm">Adjacency List Graph (BFS / DFS)</h4>
            <p className="text-xs text-[var(--text-secondary)]">BFS finds related skill clusters within 2 hops; DFS constructs learning roadmaps and prerequisite trees.</p>
            <p className="text-[10px] font-mono text-[var(--text-muted)]">Time: O(V + E) | Space: O(V)</p>
          </Card>

          <Card className="p-5 space-y-2">
            <Badge variant="success">PRIORITY QUEUE</Badge>
            <h4 className="font-bold text-sm">Max Binary Heap Ranking</h4>
            <p className="text-xs text-[var(--text-secondary)]">Ranks student candidate applications dynamically using logarithmic heapifyUp and heapifyDown operations.</p>
            <p className="text-[10px] font-mono text-[var(--text-muted)]">Time: O(N log N) | Space: O(N)</p>
          </Card>

          <Card className="p-5 space-y-2">
            <Badge variant="warning">SEAT ALLOCATION</Badge>
            <h4 className="font-bold text-sm">Greedy Seat Allocator</h4>
            <p className="text-xs text-[var(--text-secondary)]">Evaluates CGPA eligibility thresholds, ranks qualified applicants, and allocates available seats without over-allocation.</p>
            <p className="text-[10px] font-mono text-[var(--text-muted)]">Time: O(K log K) | Space: O(K)</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
