'use client';

import { useSyncExternalStore } from 'react';

const TICK_INTERVAL_MS = 1000;

const listeners = new Set<() => void>();

let currentNow = Date.now();
let timerId: number | null = null;

function tick() {
  currentNow = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!timerId) {
    timerId = window.setInterval(tick, TICK_INTERVAL_MS);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };
}

function getSnapshot() {
  return currentNow;
}

export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
