import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button, Badge, Skeleton } from '../components/UIComponents';
import { ArrowLeft, Award, DollarSign, Check, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CompareInternships = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookmarks')
      .then((res) => {
        if (res.data.success) {
          setInternships((res.data.bookmarks || []).slice(0, 3));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 max-w-5xl mx-auto"><Skeleton className="h-96" /></div>;
  if (internships.length < 2) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-lg font-bold">Need at least 2 saved internships to compare</h2>
        <p className="text-xs text-[var(--text-muted)]">Save at least two internships while exploring to view the side-by-side comparison matrix.</p>
        <Button onClick={() => navigate('/internships')}>Explore Internships</Button>
      </div>
    );
  }

  const maxStipend = Math.max(...internships.map((i) => i.stipend_monthly || 0));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="w-4 h-4" /> Back to Saved
      </button>

      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[var(--primary)]" /> Side-by-Side Internship Comparison
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Comparing top saved internships across stipend, CGPA eligibility, and skill matches.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {internships.map((item) => {
          const isBestStipend = item.stipend_monthly === maxStipend;

          return (
            <Card key={item.id} className={`p-6 space-y-4 border-2 ${isBestStipend ? 'border-emerald-500 shadow-xl' : 'border-[var(--border-color)]'}`}>
              {isBestStipend && (
                <Badge variant="success" className="w-full justify-center py-1 font-bold">
                  ★ HIGHEST STIPEND
                </Badge>
              )}
              <div className="flex items-center gap-3">
                <img src={item.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'} alt={item.company_name} className="w-10 h-10 rounded-xl object-contain border p-1 bg-white" />
                <div>
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{item.company_name}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--border-color)] text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Monthly Stipend:</span>
                  <span className="font-black text-emerald-500">₹{item.stipend_monthly?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Duration:</span>
                  <span className="font-bold">{item.duration_months} Months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Work Mode:</span>
                  <span className="font-bold">{item.work_mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Location:</span>
                  <span className="font-bold">{item.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Min CGPA:</span>
                  <span className="font-bold">{item.min_cgpa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Available Seats:</span>
                  <span className="font-bold">{item.available_seats} Seats</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {item.required_skills?.map((sk) => (
                    <span key={sk} className="px-2 py-0.5 rounded bg-[var(--bg-main)] text-[10px] font-semibold border">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
