import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { useCurrentLocation, whatsappLink } from '../lib/geo';
import { useAuth } from '../context/auth';
import { Button, Card, Spinner } from '../components/ui';
import type { EmergencyAlert, AppConfig } from '../lib/types';

const WHATSAPP = '1122';

type State = 'ready' | 'activating' | 'active' | 'resolved' | 'failed';

export default function SosPage() {
  const { user } = useAuth();
  const { location, getLocation } = useCurrentLocation();
  const [state, setState] = useState<State>('ready');
  const [confirming, setConfirming] = useState(false);
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(false);
  const watchRef = useRef<number | null>(null);

  function startTracking() {
    if (!alert) return;
    setTracking(true);
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await api.addAlertLocation(alert.id, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        } catch { /* ignore location update errors */ }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  function stopTracking() {
    setTracking(false);
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }

  useEffect(() => {
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  // Load any existing active alert on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await api.getActiveAlert();
        if (res.alert) {
          setAlert(res.alert as any);
          setState('active');
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  async function activate() {
    setError('');
    setConfirming(false);
    setState('activating');

    // Request location (best-effort; user can proceed without it)
    const loc = await getLocation();

    try {
      const res = await api.createAlert({
        alertType: 'SOS',
        message: user?.name ? `SOS from ${user.name}` : 'SOS alert',
        latitude: loc.status === 'granted' ? loc.lat : undefined,
        longitude: loc.status === 'granted' ? loc.lng : undefined,
        locationLabel: loc.status === 'granted' ? loc.label : undefined,
      });
      setAlert(res.alert as any);
      setState('active');
    } catch (e: any) {
      setError(e?.message || 'Failed to activate SOS');
      setState('failed');
    }
  }

  async function resolveAlert() {
    if (!alert) return;
    try {
      await api.resolveAlert(alert.id, 'RESOLVED');
      setState('resolved');
    } catch (e: any) {
      setError(e?.message || 'Failed to resolve alert');
    }
  }

  const isActive = state === 'active' || state === 'activating';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Emergency SOS</h1>
      <p className="text-sm text-gray-500 dark:text-brand-300 mb-6">In an emergency, activate SOS to log an alert and quickly reach your trusted contacts and emergency lines.</p>

      {error && <p className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm">{error}</p>}

      {/* Status */}
      <Card className={`p-6 mb-6 ${isActive ? 'border-red-300 dark:border-red-800' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600 dark:text-brand-200">Status</span>
          <span className={`font-bold ${state === 'active' ? 'text-red-600' : state === 'resolved' ? 'text-green-600' : 'text-gray-600 dark:text-brand-200'}`}>
            {state === 'activating' ? 'Activating…' : state === 'active' ? '⚠ Active' : state === 'resolved' ? 'Resolved' : state === 'failed' ? 'Failed' : 'Ready'}
          </span>
        </div>

        {state === 'activating' && (
          <div className="mt-6 text-center">
            <button disabled className="relative mx-auto block">
              <div className="absolute inset-0 rounded-full bg-red-500/50 animate-pulse-ring" />
              <div className="relative w-32 h-32 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shadow-xl">
                <Spinner className="h-8 w-8 border-white" />
              </div>
            </button>
            <p className="mt-3 text-sm text-gray-500 dark:text-brand-300">Activating SOS…</p>
          </div>
        )}

        {(state === 'ready' || state === 'failed') && (
          <>
            {confirming ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-brand-200 mb-4">Are you sure you want to activate SOS? This sends an emergency alert.</p>
                <div className="flex justify-center gap-3">
                  <Button variant="danger" onClick={activate}>Yes, activate SOS</Button>
                  <Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)} className="relative mx-auto mt-4 block group" aria-label="Activate SOS">
                <div className="absolute inset-0 rounded-full bg-red-500/50 animate-pulse-ring" />
                <div className="relative w-32 h-32 rounded-full bg-red-600 text-white flex flex-col items-center justify-center font-bold shadow-xl group-hover:bg-red-700 transition-colors">
                  <span className="text-4xl">🚨</span><span className="text-lg mt-1">SOS</span>
                </div>
              </button>
            )}
          </>
        )}

        {state === 'active' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-red-600 font-semibold mb-3">SOS is active. Use these to reach help:</p>
            <div className="grid gap-2">
              <a href={whatsappLink(WHATSAPP, `SheShield SOS: ${user?.name || 'A user'} needs help` + (location.status === 'granted' ? ` Location: ${location.label}` : ''))} target="_blank" rel="noopener noreferrer">
                <Button variant="danger" className="w-full">💬 Contact via WhatsApp</Button>
              </a>
              <a href="tel:1122"><Button variant="outline" className="w-full">📞 Call Rescue 1122</Button></a>
              <a href="tel:15"><Button variant="outline" className="w-full">📞 Call Police 15</Button></a>
            </div>
            {location.status === 'granted' && (
              <p className="mt-3 text-xs text-gray-500 dark:text-brand-300">📍 Shared location: {location.label}</p>
            )}
            {location.status === 'denied' && (
              <p className="mt-3 text-xs text-amber-600">Your location was not shared because permission was denied.</p>
            )}
            <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-brand-800/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-brand-200">📍 Live Location Tracking</span>
                {tracking ? (
                  <button onClick={stopTracking} className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200">Stop Tracking</button>
                ) : (
                  <button onClick={startTracking} className="text-xs px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">Start Tracking</button>
                )}
              </div>
              {tracking && <p className="text-xs text-green-600 mt-1">Your location is being shared every 30 seconds.</p>}
            </div>
            <Button variant="secondary" className="mt-4" onClick={resolveAlert}>I'm safe — resolve alert</Button>
          </div>
        )}

        {state === 'resolved' && (
          <div className="mt-4 text-center">
            <p className="text-green-600 font-semibold mb-3">Glad you're safe. Your alert has been resolved.</p>
            <Button onClick={() => { setState('ready'); setAlert(null); }}>Done</Button>
          </div>
        )}
      </Card>

      {/* Privacy note */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">🔒 How location is used</h3>
        <p className="text-sm text-gray-500 dark:text-brand-300">
          SheShield only accesses your location when you activate SOS or submit a report, and only with your permission. We never track you continuously. You can use SheShield without sharing location.
        </p>
      </Card>
    </div>
  );
}
