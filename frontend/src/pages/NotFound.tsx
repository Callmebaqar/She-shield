import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">🛡️</div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">404 — Page not found</h1>
      <p className="mt-2 text-gray-500 dark:text-brand-300">Sorry, we couldn't find that page.</p>
      <Link to="/" className="mt-6 bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700">Back to home</Link>
    </div>
  );
}
