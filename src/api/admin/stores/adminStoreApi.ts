import type { PaginatedResult } from '@/types/common';
import type { Store } from '@/types/store';
import type {
  AdminStoreListResponse,
  RejectStoreRequest,
} from '@/contracts/admin';

import { mapAdminStore } from './adminStoreMapper';
import { apiClient } from '../../apiClient';

export const adminStoreApi = {
  getStores(): Promise<PaginatedResult<Store>> {
    return apiClient
      .get<AdminStoreListResponse>('/api/admin/stores')
      .then((res) => ({ ...res, items: res.items.map(mapAdminStore) }));
  },

  getPendingStores(): Promise<PaginatedResult<Store>> {
    return apiClient
      .get<AdminStoreListResponse>('/api/admin/stores/pending')
      .then((res) => ({ ...res, items: res.items.map(mapAdminStore) }));
  },

  approveStore(id: string): Promise<void> {
    return apiClient.patch<void>(`/api/admin/stores/${id}/approve`);
  },

  rejectStore(id: string, body: RejectStoreRequest): Promise<void> {
    return apiClient.patch<void>(`/api/admin/stores/${id}/reject`, body);
  },
};
