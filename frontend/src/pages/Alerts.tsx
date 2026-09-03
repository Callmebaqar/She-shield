import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card, EmptyState, Spinner } from '../components/ui';
import { formatDate } from '../lib/geo';
import type { EmergencyAlert } from '../lib/types';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'text-red-600 font-semibold',
  ACTIVATING: 'text-amber-600 font-semibold',
  RESOLVED: 'text-green-600',
  CANCELLED: 'text-gray-500',
  FAILED: 'text-red-500',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getAlerts();
        setAlerts(res.alerts as any);
      } catch (e: any) {
        setError(e?.message || 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Alert History</h1>
      <p className="text-sm text-gray-500 dark:text-brand-300 mb-6">Your SOS activity and status.</p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {!loading && alerts.length === 0 && (
        <Card><EmptyState icon="🛡️" title="No alerts yet" text="When you activate SOS, the status and details will appear here." /></Card>
      )}

      <div className="space-y-3">
        {alerts.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{a.alertType === 'SOS' ? '🚨' : '⚠️'}</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{a.alertType}</div>
                  <div className="text-sm text-gray-500 dark:text-brand-300">{formatDate(a.activatedAt)}</div>
                </div>
              </div>
              <span className={STATUS_COLOR[a.status] || ''}>{a.status}</span>
            </div>
            {(a.message || a.latitude || a.locationLabel) && (
              <div className="mt-3 text-sm text-gray-600 dark:text-brand-200 border-t border-brand-100 dark:border-brand-800 pt-3">
                {a.message && <p>💬 {a.message}</p>}
                {a.locationLabel && <p>📍 {a.locationLabel}</p>}
                {(a.latitude != null && a.longitude != null) && <p>🛰 {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}</p>}
                {a.resolvedAt && <p className="mt-1">Resolved: {formatDate(a.resolvedAt)}</p>}
              </div>
            )}
          </Card>
        ))}
      </div>

      {loading && <div className="flex justify-center py-10"><Spinner /></div>}
    </div>
  );
}

