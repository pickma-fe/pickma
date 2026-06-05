'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { PaginatedResult } from '@/types/common';
import type { Store } from '@/types/store';
import { queryKeys } from '@/lib/queryKeys';
import { adminStoreApi } from '@/api/admin/stores/adminStoreApi';

export type AdminStoresQuery = NonNullable<
  Parameters<typeof adminStoreApi.getStores>[0]
>;

export function useAdminStores(
  params: AdminStoresQuery = {}
): UseQueryResult<PaginatedResult<Store>> {
  return useQuery<PaginatedResult<Store>>({
    queryKey: queryKeys.admin.stores.list(params),
    queryFn: () => adminStoreApi.getStores(params),
  });
}
