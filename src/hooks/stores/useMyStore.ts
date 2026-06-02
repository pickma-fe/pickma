'use client';

import { useQuery } from '@tanstack/react-query';

import type { MyStore } from '@/types/store';
import { queryKeys } from '@/lib/queryKeys';
import { storeApi } from '@/api/stores/storeApi';

export function useMyStore() {
  return useQuery<MyStore | null>({
    queryKey: queryKeys.stores.my(),
    queryFn: () => storeApi.getMyStore(),
  });
}
