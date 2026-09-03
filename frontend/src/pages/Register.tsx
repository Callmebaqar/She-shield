import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { Button, Card, Field, inputClasses } from '../components/ui';
import { ApiError } from '../lib/api';

const passwordHint = 'At least 8 characters, with a letter and a number.';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '', confirmPassword: '', name: '', password: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) errs.password = passwordHint;
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 dark:text-brand-300 mb-6">Private, secure, and made for your safety.</p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="Name" htmlFor="name" error={errors.name}>
            <input id="name" className={inputClasses} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email}>
            <input id="email" type="email" className={inputClasses} value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Phone (optional)" htmlFor="phone">
            <input id="phone" className={inputClasses} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="03XX-XXXXXXX" />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password} hint={passwordHint}>
            <input id="password" type="password" className={inputClasses} value={form.password} onChange={(e) => set('password', e.target.value)} />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <input id="confirmPassword" type="password" className={inputClasses} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} />
          </Field>
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button type="submit" loading={loading} className="w-full">Create account</Button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-500 dark:text-brand-300">
          Already have an account? <Link to="/login" className="text-brand-600 dark:text-brand-300 hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}

