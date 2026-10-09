import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Select, Button, Card } from '../components/UIComponents';
import { Sparkles, User, Building2 } from 'lucide-react';

export const Register = () => {
  const [role, setRole] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [collegeName, setCollegeName] = useState('IIT Madras');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [cgpa, setCgpa] = useState('8.5');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register({
      email,
      password,
      role,
      fullName,
      companyName,
      collegeName,
      department,
      cgpa: parseFloat(cgpa)
    });
    setLoading(false);
    if (result.success) {
      if (result.role === 'COMPANY') navigate('/company-dashboard');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)]">
      <Card className="w-full max-w-lg p-8 shadow-2xl border-[var(--border-color)]">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-[var(--primary)] text-white shadow-lg mb-3">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black">Create InternHub Account</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Join the intelligent internship matching network</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              role === 'STUDENT' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)]'
            }`}
          >
            <User className="w-4 h-4" /> Student
          </button>
          <button
            type="button"
            onClick={() => setRole('COMPANY')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              role === 'COMPANY' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)]'
            }`}
          >
            <Building2 className="w-4 h-4" /> Company
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="user@internhub.local"
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

          {role === 'STUDENT' ? (
            <>
              <Input
                label="Full Name"
                placeholder="Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="College Name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  required
                />
                <Input
                  label="CGPA (0 - 10.0)"
                  type="number"
                  step="0.01"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <Input
              label="Company Name"
              placeholder="Google / Microsoft / Zoho"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          )}

          <Button type="submit" className="w-full mt-4" loading={loading}>
            Create {role} Account
          </Button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[var(--primary)] hover:underline">
            Log In
          </Link>
        </p>
      </Card>
    </div>
  );
};
