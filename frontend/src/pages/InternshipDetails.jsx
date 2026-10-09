import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge, Skeleton } from '../components/UIComponents';
import { ChatbotModal } from '../components/ChatbotModal';
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Bot
} from 'lucide-react';

export const InternshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, addToast } = useAuth();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    api.get(`/internships/${id}`)
      .then((res) => {
        if (res.data.success) setInternship(res.data.internship);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (role !== 'STUDENT') {
      addToast('Only student accounts can submit applications.', 'error');
      return;
    }

    setApplying(true);
    try {
      const res = await api.post('/applications', { internshipId: parseInt(id, 10) });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        navigate('/applications');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit application.', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-8 max-w-4xl mx-auto"><Skeleton className="h-96" /></div>;
  if (!internship) return <div className="p-8 text-center">Internship not found.</div>;

  const studentCgpa = user?.profile?.cgpa || 7.5;
  const isCgpaEligible = parseFloat(studentCgpa) >= parseFloat(internship.min_cgpa);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="w-4 h-4" /> Back to Internships
      </button>

      {/* Main Header Banner */}
      <Card className="p-8 bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-main)]">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={internship.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150'}
              alt={internship.company_name}
              className="w-16 h-16 rounded-2xl object-contain border border-[var(--border-color)] bg-white p-2"
            />
            <div>
              <h1 className="text-2xl font-black text-[var(--text-primary)]">{internship.title}</h1>
              <p className="text-sm font-semibold text-[var(--primary)] mt-1">{internship.company_name}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {internship.location} ({internship.work_mode})</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> ₹{internship.stipend_monthly?.toLocaleString()}/month</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {internship.duration_months} Months</span>
              </div>
            </div>
          </div>

          {role === 'STUDENT' && (
            <div className="flex flex-col gap-2.5 w-full md:w-auto">
              <Button size="lg" onClick={handleApply} loading={applying}>
                Apply Now
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAiModal(true)}>
                <Bot className="w-4 h-4 text-[var(--primary)]" /> Ask InternHub AI
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Your Match Card */}
      {role === 'STUDENT' && (
        <Card className="p-6 border-l-4 border-l-[var(--primary)] bg-[var(--primary-light)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--primary)] fill-current" /> Your Match Profile
            </h3>
            <Badge variant={isCgpaEligible ? 'success' : 'danger'}>
              {isCgpaEligible ? '✓ CGPA Eligible' : 'Ineligible'}
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Your CGPA: <strong>{studentCgpa}</strong> | Required Minimum: <strong>{internship.min_cgpa}</strong>
          </p>
        </Card>
      )}

      {/* Description & Responsibilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase text-[var(--text-muted)] tracking-wider mb-3">About the Internship</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{internship.description}</p>

            <h3 className="text-sm font-bold uppercase text-[var(--text-muted)] tracking-wider mt-6 mb-3">Key Responsibilities</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{internship.responsibilities}</p>
          </Card>
        </div>

        {/* Required Skills & Company Specs */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">Required Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {internship.required_skills?.map((sk) => (
                <Badge key={sk} variant="primary">
                  {sk}
                </Badge>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--border-color)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Available Seats:</span>
                <span className="font-bold">{internship.available_seats} Seats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Application Deadline:</span>
                <span className="font-bold text-amber-500">{new Date(internship.application_deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ChatbotModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />
    </div>
  );
};
