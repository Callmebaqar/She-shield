import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button, Card, EmptyState, Field, inputClasses, Spinner } from '../components/ui';
import { useCurrentLocation, formatDate } from '../lib/geo';
import type { SafetyReport } from '../lib/types';

const CATEGORIES = [
  { value: 'UNSAFE_AREA', label: 'Unsafe Area' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity' },
  { value: 'ROAD_TRAVEL_SAFETY', label: 'Road / Travel Safety' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ category: 'UNSAFE_AREA', description: '' });
  const [useLocation, setUseLocation] = useState(false);
  const { location, getLocation } = useCurrentLocation();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  async function load() {
    try {
      const res = await api.getReports();
      setReports(res.reports as any);
    } catch (e: any) {
      setError(e?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    let lat: number | undefined;
    let lng: number | undefined;
    let label: string | undefined;
    if (useLocation) {
      const loc = await getLocation();
      if (loc.status === 'granted') {
        lat = loc.lat;
        lng = loc.lng;
        label = loc.label;
      }
    }

    try {
      const res = await api.createReport({ ...form, latitude: lat, longitude: lng, locationLabel: label });
      setReports((r) => [res.report as any, ...r]);
      setForm({ category: 'UNSAFE_AREA', description: '' });
      setUseLocation(false);
      setSuccess('Report submitted successfully. Thank you for helping keep the community safe.');
    } catch (e: any) {
      setError(e?.message || 'Failed to submit report');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Safety Reports</h1>
      <p className="text-sm text-gray-500 dark:text-brand-300 mb-6">Report unsafe areas, harassment, or suspicious activity. Reports are private to you and reviewed by moderators.</p>

      <Card className="p-6 mb-8">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Submit a report</h2>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Category" htmlFor="rep-cat">
            <select id="rep-cat" className={inputClasses} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Description" htmlFor="rep-desc" hint="At least 10 characters.">
            <textarea id="rep-desc" rows={4} className={inputClasses} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what happened..." />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-brand-200">
            <input type="checkbox" checked={useLocation} onChange={(e) => setUseLocation(e.target.checked)} className="accent-brand-600" />
            Attach my current location (optional, only with permission)
          </label>
          {useLocation && location.status === 'denied' && (
            <p className="text-xs text-amber-600">Location permission denied. Report will be submitted without location.</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button type="submit" loading={saving} disabled={form.description.trim().length < 10}>Submit report</Button>
        </form>
      </Card>

      <h2 className="font-bold text-gray-900 dark:text-white mb-3">Your reports</h2>

      {!loading && reports.length === 0 && (
        <Card><EmptyState icon="📝" title="No reports yet" text="Reports you submit will appear here with their status." /></Card>
      )}

      <div className="space-y-3">
        {reports.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">{CATEGORIES.find((c) => c.value === r.category)?.label || r.category}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[r.status] || ''}`}>{r.status.replace(/_/g, ' ')}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-brand-200">{r.description}</p>
            <div className="mt-3 text-xs text-gray-400 dark:text-brand-300 flex flex-wrap gap-3">
              <span>Submitted: {formatDate(r.createdAt)}</span>
              {r.locationLabel && <span>📍 {r.locationLabel}</span>}
              {r.adminNote && <span>Note: {r.adminNote}</span>}
            </div>
          </Card>
        ))}
      </div>

      {loading && <div className="flex justify-center py-10"><Spinner /></div>}
    </div>
  );
}

