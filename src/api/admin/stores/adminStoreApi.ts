import type { PaginatedResult } from '@/types/common';
import type { Store } from '@/types/store';
import type { AdminStoreListResponse } from '@/contracts/admin';
import { apiClient } from '@/api/apiClient';

import { mapAdminStore } from './adminStoreMapper';

export const adminStoreApi = {
  getStores(): Promise<PaginatedResult<Store>> {
    return apiClient
      .get<AdminStoreListResponse>('/api/admin/stores')
      .then((res) => ({ ...res, items: res.items.map(mapAdminStore) }));
  },
};
