import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, Button, Badge, Skeleton } from '../components/UIComponents';
import { Bell, Check } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then((res) => {
        if (res.data.success) setNotifications(res.data.notifications || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 max-w-4xl mx-auto"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Bell className="w-6 h-6 text-[var(--primary)]" /> Notification Center
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Application updates, interview alerts, and AI insights.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          <Check className="w-3.5 h-3.5" /> Mark All Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className={`p-4 flex items-center justify-between ${!n.is_read ? 'border-l-4 border-l-[var(--primary)] bg-[var(--primary-light)]' : ''}`}>
            <div>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">{n.title}</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{n.message}</p>
              <span className="text-[10px] text-[var(--text-muted)] block mt-1">{new Date(n.created_at).toLocaleString()}</span>
            </div>
            {!n.is_read && <Badge variant="primary">New</Badge>}
          </Card>
        ))}
      </div>
    </div>
  );
};
