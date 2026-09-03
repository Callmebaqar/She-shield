import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Field, inputClasses } from '../components/ui';
import { api, ApiError } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      // In dev mode, the reset link is printed in the backend console.
      setMessage(`${res.message}${'\n\n(Dev mode: the reset link appears in the backend console.)'}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Forgot password</h1>
        <p className="text-sm text-gray-500 dark:text-brand-300 mb-6">Enter your email and we'll send you a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" htmlFor="email">
            <input id="email" type="email" className={inputClasses} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600 whitespace-pre-line">{message}</p>}
          <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
        </form>
        <p className="mt-4 text-sm text-center">
          <Link to="/login" className="text-brand-600 dark:text-brand-300 hover:underline">Back to login</Link>
        </p>
      </Card>
    </div>
  );
}

