'use client';

import { useSyncExternalStore } from 'react';

import {
  getRecentProductsRawSnapshot,
  getRecentProductsServerSnapshot,
  parseRecentProducts,
  subscribeRecentProducts,
} from '@/lib/recentProducts';

export function useRecentProducts() {
  const recentProductsSnapshot = useSyncExternalStore(
    subscribeRecentProducts,
    getRecentProductsRawSnapshot,
    getRecentProductsServerSnapshot
  );

  return parseRecentProducts(recentProductsSnapshot);
}
