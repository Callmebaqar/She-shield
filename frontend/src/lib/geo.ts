import { useCallback, useState } from 'react';

export type LocationState =
  | { status: 'idle'; lat?: never; lng?: never; label?: string; error?: never }
  | { status: 'loading'; lat?: never; lng?: never; label?: string; error?: never }
  | { status: 'granted'; lat: number; lng: number; label: string; error?: never }
  | { status: 'denied'; lat?: never; lng?: never; label?: string; error: string }
  | { status: 'unavailable'; lat?: never; lng?: never; label?: string; error: string };

export function useCurrentLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' });

  const getLocation = useCallback((): Promise<LocationState> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        const s: LocationState = { status: 'unavailable', error: 'Geolocation is not supported on this device.' };
        setState(s);
        resolve(s);
        return;
      }
      setState({ status: 'loading' });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const s: LocationState = {
            status: 'granted',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          };
          setState(s);
          resolve(s);
        },
        (err) => {
          const denied = err.code === err.PERMISSION_DENIED;
          const s: LocationState = {
            status: denied ? 'denied' : 'unavailable',
            error: denied ? 'Location permission was denied. You can still use SheShield without location.' : 'Unable to get your location right now.',
          };
          setState(s);
          resolve(s);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { location: state, getLocation, reset: () => setState({ status: 'idle' }) };
}

export function whatsappLink(number: string, text: string): string {
  const clean = number.replace(/[^0-9]/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
