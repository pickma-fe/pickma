'use client';

import { useQuery } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { Store } from '@/types/store';
import { adminStoreApi } from '@/api/admin/stores/adminStoreApi';

export function useAdminStores() {
  return useQuery<PaginatedResult<Store>>({
    queryKey: ['stores', 'admin', 'list'],
    queryFn: () => adminStoreApi.getStores(),
  });
}
