import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/auth';
import { ThemeProvider } from './context/theme';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

import AppShell, { PublicLayout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import DashboardPage from './pages/Dashboard';
import SosPage from './pages/SOS';
import ContactsPage from './pages/Contacts';
import AlertsPage from './pages/Alerts';
import ReportsPage from './pages/Reports';
import ResourcesPage from './pages/Resources';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';
import AdminPage from './pages/Admin';
import NotFoundPage from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/sos" element={<SosPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute admin />}>
              <Route element={<AppShell />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
