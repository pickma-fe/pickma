'use client';

import { useEffect } from 'react';

import type { RecentProductInput } from '@/lib/recentProducts';
import { addRecentProduct } from '@/lib/recentProducts';

interface RecentProductTrackerProps {
  id: string;
  name: string;
  imageUrl?: string;
}

export function RecentProductTracker({
  id,
  name,
  imageUrl,
}: RecentProductTrackerProps) {
  useEffect(() => {
    void fetch(`/api/products/${id}/view`, {
      method: 'POST',
    }).catch(() => undefined);

    const product: RecentProductInput = {
      id,
      name,
      imageUrl,
    };

    addRecentProduct(product);
  }, [id, imageUrl, name]);

  return null;
}
