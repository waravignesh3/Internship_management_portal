import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button, Badge, Skeleton, Modal, Input } from '../components/UIComponents';
import { Users, Award, CheckCircle2, XCircle, Cpu, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CompanyApplicantsPage = () => {
  const { addToast } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [allocationResult, setAllocationResult] = useState(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');

  const fetchApplicants = () => {
    api.get('/companies/applicants')
      .then((res) => {
        if (res.data.success) setApplicants(res.data.applicants || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(`Candidate status updated to ${newStatus}`, 'success');
        fetchApplicants();
      }
    } catch (err) {
      addToast('Failed to update applicant status.', 'error');
    }
  };

  const handleRunSeatAllocation = async () => {
    if (applicants.length === 0) return;
    const internshipId = applicants[0]?.internship_id || 1;
    setAllocating(true);

    try {
      const res = await api.post('/companies/allocate-seats', { internshipId });
      if (res.data.success) {
        addToast('Greedy Seat Allocation executed successfully!', 'success');
        setAllocationResult(res.data.result);
        fetchApplicants();
      }
    } catch (err) {
      addToast('Seat allocation failed.', 'error');
    } finally {
      setAllocating(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/interviews', {
        applicationId: selectedAppId,
        title: 'Technical Round 1',
        scheduledAt: new Date(interviewDate || Date.now() + 86400000).toISOString(),
        locationOrLink: 'https://meet.google.com/abc-defg-hij'
      });
      if (res.data.success) {
        addToast('Interview scheduled successfully!', 'success');
        setShowScheduleModal(false);
        fetchApplicants();
      }
    } catch (err) {
      addToast('Failed to schedule interview.', 'error');
    }
  };

  if (loading) return <div className="p-8 max-w-6xl mx-auto"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--primary)]" /> Candidate Applicant Portal
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Review candidate applications, evaluate match scores, and manage applicant selections.</p>
        </div>
        <Button onClick={handleRunSeatAllocation} loading={allocating} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
          <Sparkles className="w-4 h-4 mr-1" /> Auto-Allocate Seats
        </Button>
      </div>

      {/* Seat Allocation Result Banner */}
      {allocationResult && (
        <Card className="p-6 bg-purple-950/20 border-purple-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Candidate Seat Allocation Output
            </h3>
            <span className="text-xs font-semibold text-purple-300">Automated Shortlist Status</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {allocationResult.allocations?.map((alloc) => (
              <div key={alloc.studentId} className="flex items-center justify-between p-2 rounded bg-[var(--bg-card)]">
                <span>{alloc.studentName} (Match: {alloc.matchScore}%, CGPA: {alloc.cgpa})</span>
                <Badge variant={alloc.isAllocated ? 'success' : 'danger'}>
                  {alloc.isAllocated ? 'SEAT ALLOCATED' : 'WAITLISTED / INELIGIBLE'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Applicant Cards List */}
      <div className="space-y-4">
        {applicants.map((app) => (
          <Card key={app.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-base text-[var(--text-primary)]">{app.full_name}</h3>
                <Badge variant={app.isEligible ? 'success' : 'danger'}>
                  {app.isEligible ? `CGPA: ${app.cgpa} (Eligible)` : `CGPA: ${app.cgpa} (Below ${app.min_cgpa})`}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{app.college_name} • {app.department}</p>
              <p className="text-xs text-[var(--text-muted)]">Applied for: <strong>{app.internship_title}</strong></p>

              <div className="flex flex-wrap gap-1 pt-1">
                {app.student_skills?.map((sk) => (
                  <span key={sk} className="px-2 py-0.5 rounded bg-[var(--bg-main)] text-[10px] font-semibold border">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="text-right">
                <span className="text-2xl font-black text-[var(--primary)]">{app.match_score}%</span>
                <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Candidate Match Score</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleStatusChange(app.id, 'SHORTLISTED')}>
                  Shortlist
                </Button>
                <Button size="sm" variant="secondary" onClick={() => {
                  setSelectedAppId(app.id);
                  setShowScheduleModal(true);
                }}>
                  <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange(app.id, 'SELECTED')}>
                  Select
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleStatusChange(app.id, 'REJECTED')}>
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for Scheduling Interview */}
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Schedule Technical Interview">
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <Input label="Interview Date & Time" type="datetime-local" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} required />
          <Button type="submit" className="w-full">
            Confirm Interview
          </Button>
        </form>
      </Modal>
    </div>
  );
};
