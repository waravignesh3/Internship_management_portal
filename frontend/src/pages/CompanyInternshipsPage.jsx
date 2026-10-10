import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button, Input, Select, Modal, Badge, Skeleton } from '../components/UIComponents';
import { Briefcase, Plus, Trash2, Edit3, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CompanyInternshipsPage = () => {
  const { addToast } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('Software Engineering');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [location, setLocation] = useState('Bangalore, India');
  const [stipendMonthly, setStipendMonthly] = useState('40000');
  const [durationMonths, setDurationMonths] = useState('6');
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [availableSeats, setAvailableSeats] = useState('5');
  const [skillsInput, setSkillsInput] = useState('React, Node.js, SQL, System Design');

  const fetchInternships = () => {
    api.get('/companies/dashboard')
      .then((res) => {
        if (res.data.success) setInternships(res.data.internships || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/internships', {
        title,
        domain,
        description,
        responsibilities,
        work_mode: workMode,
        location,
        stipend_monthly: parseInt(stipendMonthly, 10),
        duration_months: parseInt(durationMonths, 10),
        min_cgpa: parseFloat(minCgpa),
        available_seats: parseInt(availableSeats, 10),
        application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        required_skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
      });

      if (res.data.success) {
        addToast('Internship published successfully!', 'success');
        setShowModal(false);
        fetchInternships();
      }
    } catch (err) {
      addToast('Failed to publish internship.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/internships/${id}`);
      if (res.data.success) {
        addToast('Internship deleted.', 'info');
        setInternships((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      addToast('Failed to delete internship.', 'error');
    }
  };

  if (loading) return <div className="p-8 max-w-6xl mx-auto"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[var(--primary)]" /> Company Internship Manager
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Publish, edit, and manage internship listings.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Create Internship
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {internships.map((item) => (
          <Card key={item.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-xs font-semibold text-[var(--primary)] mt-0.5">{item.domain}</p>
              </div>
              <Badge variant={item.is_published ? 'success' : 'danger'}>
                {item.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>

            <div className="text-xs space-y-1 text-[var(--text-secondary)]">
              <p>📍 Location: {item.location} ({item.work_mode})</p>
              <p>💰 Stipend: ₹{item.stipend_monthly?.toLocaleString()}/month</p>
              <p>🎓 Min CGPA: {item.min_cgpa} | Seats: {item.available_seats}</p>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
              <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for Creating Internship */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Publish New Internship">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Internship Title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Software Engineering Intern" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} required />
            <Select label="Work Mode" value={workMode} onChange={(e) => setWorkMode(e.target.value)} options={[
              { label: 'Hybrid', value: 'HYBRID' },
              { label: 'Remote', value: 'REMOTE' },
              { label: 'On-Site', value: 'ON_SITE' }
            ]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Monthly Stipend (₹)" type="number" value={stipendMonthly} onChange={(e) => setStipendMonthly(e.target.value)} required />
            <Input label="Available Seats" type="number" value={availableSeats} onChange={(e) => setAvailableSeats(e.target.value)} required />
          </div>
          <Input label="Minimum CGPA Requirement" type="number" step="0.1" value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)} required />
          <Input label="Required Skills (Comma separated)" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} required />

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-3 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)]" />
          </div>

          <Button type="submit" loading={saving} className="w-full">
            Publish Internship
          </Button>
        </form>
      </Modal>
    </div>
  );
};
