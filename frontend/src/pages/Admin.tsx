import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button, Card, EmptyState, Spinner } from '../components/ui';
import { formatDate } from '../lib/geo';
import type { AdminStats, SafetyReport, User } from '../lib/types';

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'overview' | 'users' | 'reports'>('overview');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [s, u, r] = await Promise.all([api.adminStats(), api.adminUsers(), api.adminReports()]);
      setStats(s.stats as any);
      setUsers(u.users as any);
      setReports(r.reports as any);
    } catch (e: any) {
      setError(e?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateUserStatus(id: string, isActive: boolean) {
    await api.adminUpdateUser(id, { isActive });
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, isActive } : x)));
  }

  async function updateReport(id: string, status: string) {
    await api.adminUpdateReport(id, { status });
    setReports((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    load();
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (error) return <p className="text-red-600">{error}</p>;

  const statCards = stats ? [
    { label: 'Total users', value: stats.totalUsers, icon: '👥' },
    { label: 'Active alerts', value: stats.activeAlerts, icon: '🚨' },
    { label: 'Total reports', value: stats.totalReports, icon: '📝' },
    { label: 'Pending reports', value: stats.pendingReports, icon: '⏳' },
  ] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <Button variant="secondary" onClick={load}>Refresh</Button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['overview', 'users', 'reports'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === t ? 'bg-brand-600 text-white' : 'bg-brand-100 dark:bg-brand-800 text-brand-800 dark:text-white'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((c) => (
              <Card key={c.label} className="p-5 text-center">
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{c.value}</div>
                <div className="text-xs text-gray-500 dark:text-brand-300">{c.label}</div>
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Recent activity</h2>
            {stats?.recentActivity.length ? (
              <div className="space-y-2">
                {stats.recentActivity.map((a) => (
                  <div key={a.id} className="text-sm flex justify-between bg-brand-50 dark:bg-brand-800/50 p-3 rounded-lg">
                    <span className="text-gray-700 dark:text-brand-200">{a.action} {a.user ? `· ${a.user.name}` : ''}</span>
                    <span className="text-gray-400">{formatDate(a.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyState icon="📊" title="No activity yet" />}
          </Card>
        </div>
      )}

      {tab === 'users' && (
        <Card className="p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Users</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-800/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    {u.name} <span className="text-xs px-2 py-0.5 rounded-full bg-brand-200 dark:bg-brand-700 text-brand-800 dark:text-white ml-1">{u.role}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-brand-300">{u.email} · alerts: {u._count?.emergencyAlerts ?? 0} · reports: {u._count?.safetyReports ?? 0} · {formatDate(u.createdAt)}</div>
                </div>
                <button
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  onClick={() => updateUserStatus(u.id, !u.isActive)}
                >
                  {u.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'reports' && (
        <Card className="p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Reports</h2>
          {reports.length === 0 ? <EmptyState icon="📝" title="No reports" /> : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="p-4 bg-brand-50 dark:bg-brand-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-white">{r.category.replace(/_/g, ' ')}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[r.status] || ''}`}>{r.status.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-brand-200 mt-1">{r.description}</p>
                  <div className="text-xs text-gray-400 mt-1">{r.user?.name} · {formatDate(r.createdAt)}</div>
                  <div className="mt-3 flex gap-2">
                    {['UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((s) => (
                      <button key={s} disabled={r.status === s} onClick={() => updateReport(r.id, s)} className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-brand-900 border border-gray-300 dark:border-brand-700 text-gray-700 dark:text-brand-200 disabled:opacity-50">
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

