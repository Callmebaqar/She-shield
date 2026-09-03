import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { STAY_SAFE, HOW_IT_WORKS, SAFETY_RESOURCES } from '../data/content';
import { whatsappLink } from '../lib/geo';
import { Card, Button, Field, inputClasses } from '../components/ui';

const DEFAULT_NUMBERS = [
  { label: 'Emergency Rescue (1122)', number: '1122', type: 'phone' },
  { label: 'Police (Pakistan)', number: '15', type: 'phone' },
  { label: 'Women Helpline (1098)', number: '1098', type: 'phone' },
  { label: 'FIA Cyber Crime', number: '991', type: 'phone' },
];

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div>
      <Hero />
      <EmergencyNumbers />
      <StaySafe />
      <HowItWorks />
      <Resources />
      <ContactForm />
    </div>
  );
}

function Hero() {
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-brand-950 dark:via-brand-950 dark:to-brand-900 py-20 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <span className="inline-block bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-200 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
          Digital Safety for Young Women
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-brand-800 dark:text-white leading-tight">
          Empowering <span className="text-accent-500">Girls</span> to Navigate
          the Digital World <span className="text-brand-600">Safely</span>
        </h1>
        <p className="mt-5 text-lg text-gray-600 dark:text-brand-200 max-w-2xl mx-auto">
          SheShield helps you spot online risks, preserve evidence, find support, and get help in an emergency — privately and without judgment.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!user ? (
            <>
              <Link to="/register" className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700">Get Started</Link>
              <Link to="/login" className="border-2 border-brand-600 text-brand-700 dark:text-brand-300 px-6 py-3 rounded-xl font-semibold hover:bg-brand-50">Log in</Link>
            </>
          ) : (
            <Link to="/dashboard" className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700">Go to Dashboard</Link>
          )}
          <a href={whatsappLink('1122', 'SheShield: I need emergency help. Please contact me.')} target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700">
            ⚠ Emergency / SOS
          </a>
        </div>
      </div>
    </section>
  );
}

function EmergencyNumbers() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Card className="p-6 border-red-200 dark:border-red-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">🚨 Emergency Numbers (Pakistan)</h2>
        <p className="text-sm text-gray-500 dark:text-brand-300 mb-4">Tap any number to call it directly.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DEFAULT_NUMBERS.map((n) => (
            <a key={n.label} href={`tel:${n.number}`} className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 hover:bg-red-100 transition-colors">
              <span className="text-2xl mb-1">📞</span>
              <span className="font-extrabold text-red-700 dark:text-red-400 text-lg">{n.number}</span>
              <span className="text-xs text-center text-gray-600 dark:text-brand-300">{n.label.split('(')[0].trim()}</span>
            </a>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-brand-300">
          Call 1122 for rescue, 15 for police, and 1098 for the women's helpline. For online crimes, contact FIA's cyber-crime wing at 991.
        </p>
      </Card>
    </section>
  );
}

function StaySafe() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">What to Avoid to Stay Safe</h2>
        <p className="mt-2 text-gray-500 dark:text-brand-300">Simple habits that protect you from harassment and scams online.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAY_SAFE.avoid.map((item) => (
          <Card key={item.title} className="p-5">
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">✗ {item.title}</h3>
            <p className="text-sm text-gray-500 dark:text-brand-300">{item.text}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-6 border-green-200 dark:border-green-900">
        <h3 className="font-bold text-green-700 dark:text-green-400 mb-3">✓ Do this instead</h3>
        <ul className="space-y-2">
          {STAY_SAFE.do.map((d) => (
            <li key={d} className="flex gap-2 text-sm text-gray-700 dark:text-brand-200">
              <span className="text-green-600">•</span>{d}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">How It Works</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {HOW_IT_WORKS.map((s) => (
          <Card key={s.step} className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-200 flex items-center justify-center text-2xl">{s.icon}</div>
            <span className="inline-block text-xs font-bold text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-900 px-2 py-0.5 rounded-full mb-2">STEP {s.step}</span>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{s.title}</h3>
            <p className="text-sm text-gray-500 dark:text-brand-300">{s.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Resources() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-4">
        {SAFETY_RESOURCES.map((r) => (
          <Card key={r.title} className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{r.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white">{r.title}</h3>
            </div>
            <ul className="space-y-2">
              {r.items.map((i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-brand-300">
                  <span className="text-brand-600">•</span>{i}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <div className="text-center mt-6">
        <Link to="/resources" className="text-brand-600 dark:text-brand-300 font-semibold">View all safety resources →</Link>
      </div>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.message) {
      setError('Please fill in your name and message.');
      return;
    }
    const subject = encodeURIComponent(`SheShield feedback from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.email || 'anonymous'}`);
    window.open(`mailto:feedback@sheshield.app?subject=${subject}&body=${body}`, '_self');
    setSent(true);
  }

  return (
    <section id="contact" className="max-w-2xl mx-auto px-4 py-12">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Contact / Feedback</h2>
        <p className="text-sm text-gray-500 dark:text-brand-300 mb-6">Share your feedback to help us improve SheShield. Email is optional.</p>
        {sent ? (
          <p className="text-green-600 font-medium">Your email app has been opened. Thank you for your feedback! 💜</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" htmlFor="cf-name">
                <input id="cf-name" className={inputClasses} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Optional" />
              </Field>
              <Field label="Email" htmlFor="cf-email">
                <input id="cf-email" type="email" className={inputClasses} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Optional" />
              </Field>
            </div>
            <Field label="Message" htmlFor="cf-msg">
              <textarea id="cf-msg" rows={4} className={inputClasses} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your feedback..." />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">Send Feedback</Button>
          </form>
        )}
      </Card>
    </section>
  );
}

