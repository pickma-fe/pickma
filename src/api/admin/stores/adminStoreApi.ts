import type { PaginatedResult } from '@/types/common';
import type { Store } from '@/types/store';
import type {
  AdminStoreListQuery,
  AdminStoreListResponse,
} from '@/contracts/admin';
import { apiClient } from '@/api/apiClient';

import { mapAdminStore } from './adminStoreMapper';

export const adminStoreApi = {
  getStores(params: AdminStoreListQuery = {}): Promise<PaginatedResult<Store>> {
    return apiClient
      .get<AdminStoreListResponse>('/api/admin/stores', params)
      .then((res) => ({ ...res, items: res.items.map(mapAdminStore) }));
  },
};
