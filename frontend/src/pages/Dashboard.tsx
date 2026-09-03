import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { api } from '../lib/api';
import { Card, EmptyState, Spinner } from '../components/ui';
import type { EmergencyContact, EmergencyAlert, SafetyReport } from '../lib/types';

type Data = { contacts: EmergencyContact[]; alerts: EmergencyAlert[]; reports: SafetyReport[] };

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Data>({ contacts: [], alerts: [], reports: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [c, a, r] = await Promise.all([api.getContacts(), api.getAlerts(), api.getReports()]);
        setData({ contacts: c.contacts as any, alerts: a.alerts as any, reports: r.reports as any });
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeAlert = data.alerts.find((x) => x.status === 'ACTIVE' || x.status === 'ACTIVATING');

  const quickActions = [
    { to: '/sos', icon: '🚨', title: 'SOS', color: 'bg-red-600 text-white' },
    { to: '/contacts', icon: '👤', title: 'Contacts', color: 'bg-brand-600 text-white' },
    { to: '/reports', icon: '📢', title: 'Report', color: 'bg-indigo-600 text-white' },
    { to: '/resources', icon: '📚', title: 'Resources', color: 'bg-green-600 text-white' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 dark:text-brand-300">Your safety is our priority.</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col items-center justify-center border-red-200 dark:border-red-900">
          <span className="text-sm text-gray-500 dark:text-brand-300">Safety status</span>
          {activeAlert ? (
            <span className="mt-1 font-bold text-red-600 text-lg">⚠ Active alert</span>
          ) : (
            <span className="mt-1 font-bold text-green-600 text-lg flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" /> Safe</span>
          )}
        </Card>
        <Card className="p-5 text-center">
          <span className="text-sm text-gray-500 dark:text-brand-300">Emergency contacts</span>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.contacts.length}</div>
        </Card>
        <Card className="p-5 text-center">
          <span className="text-sm text-gray-500 dark:text-brand-300">Reports</span>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.reports.length}</div>
        </Card>
      </div>

      {/* SOS */}
      <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-red-200 dark:border-red-900">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Emergency SOS</h2>
          <p className="text-sm text-gray-500 dark:text-brand-300 mt-1">Activate an SOS alert and share your location with your trusted contacts.</p>
        </div>
        <Link to="/sos" className="relative">
          <div className="absolute inset-0 rounded-full bg-red-500/50 animate-pulse-ring" />
          <div className="relative w-24 h-24 rounded-full bg-red-600 text-white flex flex-col items-center justify-center font-bold shadow-lg">
            <span className="text-2xl leading-none">🚨</span>
            <span className="text-sm mt-1">SOS</span>
          </div>
        </Link>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((q) => (
          <Link key={q.title} to={q.to} className={`${q.color} rounded-2xl p-5 flex flex-col items-center gap-2 font-semibold hover:opacity-90 transition-opacity`}>
            <span className="text-3xl">{q.icon}</span>
            <span>{q.title}</span>
          </Link>
        ))}
      </div>

      {/* Recent */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 dark:text-white">Recent alerts</h2>
            <Link to="/alerts" className="text-sm text-brand-600 dark:text-brand-300">View all</Link>
          </div>
          {data.alerts.length === 0 ? (
            <EmptyState icon="🛡️" title="No alerts yet" text="Your SOS activity will appear here." />
          ) : (
            <div className="space-y-2">
              {data.alerts.slice(0, 3).map((a) => (
                <div key={a.id} className="flex justify-between text-sm bg-brand-50 dark:bg-brand-800/50 p-3 rounded-lg">
                  <span className="font-medium text-gray-800 dark:text-white">{a.alertType}</span>
                  <span className={a.status === 'ACTIVE' ? 'text-red-600 font-semibold' : 'text-gray-500'}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 dark:text-white">Recent reports</h2>
            <Link to="/reports" className="text-sm text-brand-600 dark:text-brand-300">View all</Link>
          </div>
          {data.reports.length === 0 ? (
            <EmptyState icon="📝" title="No reports yet" text="Your safety reports will appear here." />
          ) : (
            <div className="space-y-2">
              {data.reports.slice(0, 3).map((r) => (
                <div key={r.id} className="flex justify-between text-sm bg-brand-50 dark:bg-brand-800/50 p-3 rounded-lg">
                  <span className="font-medium text-gray-800 dark:text-white">{r.category.replace(/_/g, ' ')}</span>
                  <span className="text-gray-500">{r.status.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {loading && <div className="flex justify-center py-6"><Spinner /></div>}
    </div>
  );
}

