import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { api, ApiError } from '../lib/api';
import { Button, Card, Field, inputClasses, Modal } from '../components/ui';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    setError('');
    if (!deletePassword) { setError('Please enter your password'); return; }
    if (confirmText !== 'DELETE') { setError('Please type DELETE exactly to confirm.'); return; }
    setDeleting(true);
    try {
      await api.deleteMe(deletePassword);
      await logout();
      navigate('/');
    } catch (e: any) {
      setError(e?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-brand-300">Privacy, data, and account management.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">🔒 Privacy & location</h2>
        <p className="text-sm text-gray-500 dark:text-brand-300 mb-3">
          SheShield only uses your location when you activate SOS or submit a report. To change location permissions, use your browser or device settings. This page only stores data you submit.
        </p>
        <p className="text-sm text-gray-500 dark:text-brand-300">
          Your browser controls can revoke location access at any time. Revoking it does not delete your account.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">Sign out</h2>
        <p className="text-sm text-gray-500 dark:text-brand-300 mb-3">End your current session on this device.</p>
        <Button variant="outline" onClick={async () => { await logout(); navigate('/'); }}>Log out</Button>
      </Card>

      <Card className="p-6 border-red-200 dark:border-red-900">
        <h2 className="font-bold text-red-600 mb-3">Danger zone</h2>
        <p className="text-sm text-gray-500 dark:text-brand-300 mb-3">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setShowDelete(true)}>Delete account</Button>
      </Card>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete account">
        <p className="text-sm text-gray-600 dark:text-brand-200 mb-3">
          This permanently deletes your account, emergency contacts, alerts, and reports. Type <strong>DELETE</strong> to confirm.
        </p>
        <Field label="Enter your password to confirm" htmlFor="del-pw">
          <input id="del-pw" type="password" className={inputClasses} value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Your password" />
        </Field>
        <input className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-brand-700 bg-white dark:bg-brand-900 text-gray-900 dark:text-white" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={deleteAccount} loading={deleting}>Delete forever</Button>
        </div>
      </Modal>
    </div>
  );
}

