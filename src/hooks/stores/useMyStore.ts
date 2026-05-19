'use client';

import { useQuery } from '@tanstack/react-query';

import type { MyStore } from '@/types/store';
import { storeApi } from '@/api/stores/storeApi';

export function useMyStore() {
  return useQuery<MyStore | null>({
    queryKey: ['stores', 'my'],
    queryFn: () => storeApi.getMyStore(),
  });
}
