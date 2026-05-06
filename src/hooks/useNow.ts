'use client';

import { useSyncExternalStore } from 'react';

const TICK_INTERVAL_MS = 1000;

const listeners = new Set<() => void>();

let currentNow: number | null = null;
let timerId: number | null = null;

function tick() {
  currentNow = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!timerId) {
    tick();
    timerId = window.setInterval(tick, TICK_INTERVAL_MS);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && timerId) {
      window.clearInterval(timerId);
      timerId = null;
      currentNow = null;
    }
  };
}

function getSnapshot() {
  return currentNow;
}

function getServerSnapshot() {
  return null;
}

export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
