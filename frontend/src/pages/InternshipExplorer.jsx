import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Input, Select, Button, Card, Badge, Skeleton, EmptyState } from '../components/UIComponents';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Sparkles,
  Bookmark,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const InternshipExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast, role } = useAuth();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());

  // Search & Filter State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [domain, setDomain] = useState('');
  const [workMode, setWorkMode] = useState('ANY');
  const [minStipend, setMinStipend] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchInternships = () => {
    setLoading(true);
    const query = new URLSearchParams({
      search,
      domain,
      workMode,
      minStipend,
      sortBy
    }).toString();

    api.get(`/internships?${query}`)
      .then((res) => {
        if (res.data.success) setInternships(res.data.internships || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInternships();
    if (role === 'STUDENT') {
      api.get('/bookmarks')
        .then((res) => {
          if (res.data.success) {
            setSavedIds(new Set(res.data.bookmarks.map((b) => b.id)));
          }
        })
        .catch(() => {});
    }
  }, [domain, workMode, sortBy]);

  const handleSaveToggle = async (internshipId) => {
    try {
      const res = await api.post('/bookmarks/toggle', { internshipId });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (res.data.saved) next.add(internshipId);
          else next.delete(internshipId);
          return next;
        });
      }
    } catch (err) {
      addToast('Failed to toggle bookmark.', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-[var(--primary)]" /> Internship Discovery
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Explore and apply for top tech internships matched to your skills.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <Card className="p-4 bg-[var(--bg-card)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchInternships();
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="md:col-span-2 relative">
            <Input
              placeholder="Search title, company, skill (e.g. C++, DSA, Node.js)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            options={[
              { label: 'Work Mode: All', value: 'ANY' },
              { label: 'Hybrid', value: 'HYBRID' },
              { label: 'Remote', value: 'REMOTE' },
              { label: 'On-Site', value: 'ON_SITE' }
            ]}
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { label: 'Sort: Newest First', value: 'newest' },
              { label: 'Highest Stipend', value: 'stipend_desc' },
              { label: 'Deadline Approaching', value: 'deadline_asc' }
            ]}
          />
        </form>
      </Card>

      {/* Internships Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : internships.length === 0 ? (
        <EmptyState
          title="No Internships Found"
          description="Try broadening your search query or reset the applied filters."
          actionLabel="Reset Search"
          onAction={() => {
            setSearch('');
            setWorkMode('ANY');
            setSortBy('newest');
            fetchInternships();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {internships.map((intern) => {
            const isSaved = savedIds.has(intern.id);
            return (
              <Card key={intern.id} hover className="flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={intern.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'}
                        alt={intern.company_name}
                        className="w-10 h-10 rounded-xl object-contain border border-[var(--border-color)] p-1 bg-white"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">{intern.title}</h3>
                        <p className="text-xs font-medium text-[var(--text-secondary)]">{intern.company_name}</p>
                      </div>
                    </div>
                    {role === 'STUDENT' && (
                      <button
                        onClick={() => handleSaveToggle(intern.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {intern.location} ({intern.work_mode})
                    </div>
                    <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> ₹{intern.stipend_monthly?.toLocaleString()}/month
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Duration: {intern.duration_months} Months | Seats: {intern.available_seats}
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {intern.required_skills?.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-color)] text-[10px] font-semibold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                    Min CGPA: {intern.min_cgpa}
                  </span>
                  <Link to={`/internships/${intern.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
