import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Card } from '../components/UIComponents';
import { Sparkles, UserCheck, Shield, Building2, KeyRound } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.role === 'ADMIN') navigate('/admin-dashboard');
      else if (result.role === 'COMPANY') navigate('/company-dashboard');
      else navigate('/dashboard');
    }
  };

  const handleDemoFill = (roleType) => {
    if (roleType === 'ADMIN') {
      setEmail('admin@internhub.local');
      setPassword('Password123!');
    } else if (roleType === 'STUDENT') {
      setEmail('student@internhub.local');
      setPassword('Password123!');
    } else if (roleType === 'COMPANY') {
      setEmail('company@internhub.local');
      setPassword('Password123!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)]">
      <Card className="w-full max-w-md p-8 shadow-2xl border-[var(--border-color)]">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-[var(--primary)] text-white shadow-lg mb-3">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black">Welcome Back</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Log in to access your InternHub dashboard</p>
        </div>

        {/* Demo Account Fill Bar */}
        <div className="mb-6 p-3 rounded-xl bg-[var(--primary-light)] border border-[var(--primary)]/30">
          <p className="text-[10px] font-bold uppercase text-[var(--primary)] mb-2 tracking-wider flex items-center gap-1">
            <KeyRound className="w-3 h-3" /> Quick Demo Login (Click to Fill):
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleDemoFill('STUDENT')}
              className="py-1 px-2 text-[10px] font-bold rounded bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--primary)] border border-transparent shadow-xs flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-blue-500" /> Student
            </button>
            <button
              onClick={() => handleDemoFill('COMPANY')}
              className="py-1 px-2 text-[10px] font-bold rounded bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--primary)] border border-transparent shadow-xs flex items-center justify-center gap-1"
            >
              <Building2 className="w-3 h-3 text-purple-500" /> Company
            </button>
            <button
              onClick={() => handleDemoFill('ADMIN')}
              className="py-1 px-2 text-[10px] font-bold rounded bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--primary)] border border-transparent shadow-xs flex items-center justify-center gap-1"
            >
              <Shield className="w-3 h-3 text-emerald-500" /> Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="student@internhub.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full mt-2" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[var(--primary)] hover:underline">
            Register Here
          </Link>
        </p>
      </Card>
    </div>
  );
};
