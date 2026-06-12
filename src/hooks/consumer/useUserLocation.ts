'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

import { userApi } from '@/api/users/userApi';

const STORAGE_KEY = 'pickma_user_location';

export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  savedAt: number;
}

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedLocation: UserLocation | null = null;

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  listeners.add(callback);
  window.addEventListener('storage', handler);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handler);
  };
}

function isUserLocation(value: unknown): value is UserLocation {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.lat === 'number' &&
    typeof obj.lng === 'number' &&
    typeof obj.address === 'string' &&
    typeof obj.savedAt === 'number'
  );
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
    const parsed: unknown = JSON.parse(raw);
    if (!isUserLocation(parsed)) {
      cachedRaw = null;
      cachedLocation = null;
      return null;
    }
    cachedLocation = parsed;
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

function persistLocation(next: UserLocation): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notify();
}

function getUserLocationFromProfile(
  user: Awaited<ReturnType<typeof userApi.getMe>>
): UserLocation | null {
  if (
    user.locationLat === undefined ||
    user.locationLng === undefined ||
    !user.locationAddress
  ) {
    return null;
  }

  return {
    lat: user.locationLat,
    lng: user.locationLng,
    address: user.locationAddress,
    savedAt: Date.now(),
  };
}

export function useUserLocation() {
  const location = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const attemptedServerHydrationRef = useRef(false);

  useEffect(() => {
    if (location || attemptedServerHydrationRef.current) return;

    attemptedServerHydrationRef.current = true;

    void userApi
      .getMe()
      .then((user) => {
        const serverLocation = getUserLocationFromProfile(user);

        if (!serverLocation || getSnapshot()) {
          return;
        }

        persistLocation(serverLocation);
      })
      .catch(() => undefined);
  }, [location]);

  const saveLocation = useCallback((next: Omit<UserLocation, 'savedAt'>) => {
    const value: UserLocation = { ...next, savedAt: Date.now() };
    persistLocation(value);

    void userApi
      .updateMe({
        locationLat: value.lat,
        locationLng: value.lng,
        locationAddress: value.address,
      })
      .catch(() => undefined);
  }, []);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    notify();

    void userApi
      .updateMe({
        locationLat: null,
        locationLng: null,
        locationAddress: null,
      })
      .catch(() => undefined);
  }, []);

  return { location, saveLocation, clearLocation };
}
