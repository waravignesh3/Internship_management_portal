import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, Button, Badge, Skeleton, EmptyState } from '../components/UIComponents';
import { Bookmark, MapPin, DollarSign, Clock, ArrowRight } from 'lucide-react';

export const SavedInternships = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookmarks')
      .then((res) => {
        if (res.data.success) setBookmarks(res.data.bookmarks || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (internshipId) => {
    try {
      const res = await api.post('/bookmarks/toggle', { internshipId });
      if (res.data.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== internshipId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500 fill-current" /> Saved Internships
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Review saved roles and compare deadlines.</p>
        </div>
        {bookmarks.length >= 2 && (
          <Link to="/compare">
            <Button variant="outline">Compare Saved Roles</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : bookmarks.length === 0 ? (
        <EmptyState title="No Saved Internships" description="Bookmark roles while exploring to keep track of deadlines!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.logo_url || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100'} alt={item.company_name} className="w-10 h-10 rounded-xl object-contain border p-1 bg-white" />
                    <div>
                      <h3 className="font-bold text-sm">{item.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)]">{item.company_name}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(item.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {item.location} ({item.work_mode})</div>
                  <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> ₹{item.stipend_monthly?.toLocaleString()}/month</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <Badge variant="warning">Deadline: {new Date(item.application_deadline).toLocaleDateString()}</Badge>
                <Link to={`/internships/${item.id}`}>
                  <Button size="sm">Apply Now <ArrowRight className="w-3.5 h-3.5" /></Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
