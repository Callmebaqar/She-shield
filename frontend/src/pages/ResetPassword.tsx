import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Field, inputClasses } from '../components/ui';
import { api, ApiError } from '../lib/api';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.resetPassword({ token, password, confirmPassword: confirm });
      setMessage(res.message);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reset your password</h1>
        <p className="text-sm text-gray-500 dark:text-brand-300 mb-6">Choose a new strong password.</p>
        {!token ? (
          <p className="text-red-600 text-sm">Missing reset token. Please use the link from your email.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="New password" htmlFor="pw">
              <input id="pw" type="password" className={inputClasses} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
            <Field label="Confirm new password" htmlFor="pw2">
              <input id="pw2" type="password" className={inputClasses} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}
            <Button type="submit" loading={loading} className="w-full">Reset password</Button>
          </form>
        )}
        <p className="mt-4 text-sm text-center">
          <Link to="/login" className="text-brand-600 dark:text-brand-300 hover:underline">Back to login</Link>
        </p>
      </Card>
    </div>
  );
}

