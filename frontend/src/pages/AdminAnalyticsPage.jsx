import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Skeleton } from '../components/UIComponents';
import { BarChart3, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then((res) => {
        if (res.data.success) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 max-w-6xl mx-auto"><Skeleton className="h-96" /></div>;

  const COLORS = ['#2563eb', '#9333ea', '#10b981', '#f97316', '#ef4444', '#06b6d4'];
  const { monthlyApps = [], domainDistribution = [], skillDemand = [] } = data || {};

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[var(--primary)]" /> System Analytics & Reports
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Recharts visual insights for placement officers and administrators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications Bar Chart */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--primary)]" /> Applications & Selections Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyApps}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="applications" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Applications" />
                <Bar dataKey="selections" fill="#10b981" radius={[4, 4, 0, 0]} name="Selections" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Demand Distribution */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-500" /> Top Demanded Skills
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={skillDemand.slice(0, 5)}>
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="demand" fill="#9333ea" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
