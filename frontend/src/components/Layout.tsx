import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { useTheme } from '../context/theme';

const appNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/sos', label: 'SOS' },
  { to: '/contacts', label: 'Contacts' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/reports', label: 'Reports' },
  { to: '/resources', label: 'Resources' },
];

function PublicHeader() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-brand-950/90 backdrop-blur border-b border-brand-100 dark:border-brand-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold text-brand-700 dark:text-brand-300">
          She<span className="text-accent-500">Shield</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="text-gray-600 dark:text-brand-200 hover:text-brand-700">Home</Link>
          <Link to="/resources" className="text-gray-600 dark:text-brand-200 hover:text-brand-700">Resources</Link>
          <Link to="/sos" className="hidden sm:block text-red-600 font-bold hover:text-red-700">Emergency</Link>
          <button onClick={toggle} aria-label="Toggle theme" className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</button>
          <Link to="/login" className="text-brand-700 dark:text-brand-300 font-semibold">Log in</Link>
          <Link to="/register" className="bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700">Get Started</Link>
        </nav>
      </div>
    </header>
  );
}

function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-brand-950/90 backdrop-blur border-b border-brand-100 dark:border-brand-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-2xl" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button>
            <Link to="/dashboard" className="text-2xl font-extrabold text-brand-700 dark:text-brand-300">
              She<span className="text-accent-500">Shield</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {appNav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg ${isActive ? 'bg-brand-100 dark:bg-brand-800 text-brand-800 dark:text-white' : 'text-gray-600 dark:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-800/50'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={({ isActive }) => `px-3 py-2 rounded-lg font-semibold ${isActive ? 'bg-brand-100 dark:bg-brand-800 text-brand-800' : 'text-gray-600 dark:text-brand-200 hover:bg-brand-50'}`}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggle} aria-label="Toggle theme" className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</button>
            <Link to="/profile" className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-brand-200">
              <span className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </Link>
            <Link to="/sos" className="bg-red-600 text-white text-sm px-3 py-2 rounded-xl font-bold hover:bg-red-700">SOS</Link>
            <button onClick={logout} className="text-sm text-gray-500 dark:text-brand-300 hover:text-red-600 font-medium">Logout</button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-brand-100 dark:border-brand-800 bg-white dark:bg-brand-950 px-4 py-3">
            <nav className="grid gap-1 text-sm font-medium" onClick={() => setOpen(false)}>
              {appNav.map((n) => (
                <NavLink key={n.to} to={n.to} className={`px-3 py-2 rounded-lg ${loc.pathname === n.to ? 'bg-brand-100 dark:bg-brand-800 text-brand-800' : 'text-gray-600 dark:text-brand-200'}`}>
                  {n.label}
                </NavLink>
              ))}
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" className="px-3 py-2 rounded-lg text-gray-600 dark:text-brand-200">Admin</NavLink>
              )}
              <NavLink to="/profile" className="px-3 py-2 rounded-lg text-gray-600 dark:text-brand-200">Profile</NavLink>
              <NavLink to="/settings" className="px-3 py-2 rounded-lg text-gray-600 dark:text-brand-200">Settings</NavLink>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-brand-100 dark:border-brand-800 py-6 text-center text-sm text-gray-500 dark:text-brand-300">
        © {new Date().getFullYear()} SheShield — Built for a safer digital world.
      </footer>
    </div>
  );
}

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-brand-100 dark:border-brand-800 py-6 text-center text-sm text-gray-500 dark:text-brand-300">
        © {new Date().getFullYear()} SheShield — Built for a safer digital world.
      </footer>
    </div>
  );
}

export default AppShell;
