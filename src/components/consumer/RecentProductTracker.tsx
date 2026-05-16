'use client';

import { useEffect } from 'react';

import type { RecentProductInput } from '@/lib/recentProducts';
import { addRecentProduct } from '@/lib/recentProducts';

interface RecentProductTrackerProps {
  product: RecentProductInput;
}

export function RecentProductTracker({ product }: RecentProductTrackerProps) {
  useEffect(() => {
    addRecentProduct(product);
  }, [product]);

  return null;
}
