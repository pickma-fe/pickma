import type { MyStore } from '@/types/store';
import type { CreateStoreRequest, StoreResponse } from '@/contracts/store';

import { apiClient } from '../apiClient';
import { mapMyStore } from './storeMapper';

export const storeApi = {
  createStore(body: CreateStoreRequest): Promise<MyStore> {
    return apiClient.post<StoreResponse>('/api/stores', body).then(mapMyStore);
  },

  getMyStore(): Promise<MyStore> {
    return apiClient.get<StoreResponse>('/api/stores/me').then(mapMyStore);
  },
};
