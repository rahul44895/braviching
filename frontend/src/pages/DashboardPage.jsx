import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import '../styles/dashboard.css';

// Deliberately lightweight: stat cards computed client-side from the already-scoped list
// endpoints (no new backend endpoint needed) -- this is a landing page, not an analytics product.
export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [clients, campaigns, tasks] = await Promise.all([
          api.get('/clients'),
          api.get('/campaigns'),
          api.get('/tasks'),
        ]);
        setStats({
          clients: clients.length,
          activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
          openTasks: tasks.filter((t) => t.status !== 'done').length,
        });
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  return (
    <div className="page">
      <PageHeader title={`Welcome, ${user.name}`} description={`Signed in as ${user.role}`} />

      {error && <div className="page-error">{error}</div>}

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card__value">{stats.clients}</div>
            <div className="stat-card__label">Clients accessible to you</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{stats.activeCampaigns}</div>
            <div className="stat-card__label">Active campaigns</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{stats.openTasks}</div>
            <div className="stat-card__label">Open / in-progress tasks</div>
          </div>
        </div>
      )}
    </div>
  );
}
