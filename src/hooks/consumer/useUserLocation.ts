'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'pickma_user_location';

export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  savedAt: number;
}

const listeners = new Set<() => void>();
let cachedRaw: string | null = undefined as unknown as string | null;
let cachedLocation: UserLocation | null = null;

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): UserLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedLocation;
    cachedRaw = raw;
    if (!raw) {
      cachedLocation = null;
      return null;
    }
    cachedLocation = JSON.parse(raw) as UserLocation;
    return cachedLocation;
  } catch {
    cachedRaw = null;
    cachedLocation = null;
    return null;
  }
}

function getServerSnapshot(): null {
  return null;
}

export function useUserLocation() {
  const location = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const saveLocation = useCallback((next: Omit<UserLocation, 'savedAt'>) => {
    const value: UserLocation = { ...next, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    notify();
  }, []);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    notify();
  }, []);

  return { location, saveLocation, clearLocation };
}
