import type { MyStore } from '@/types/store';
import type { CreateStoreRequest, StoreResponse } from '@/contracts/store';

import { ApiError, apiClient } from '../apiClient';
import { mapMyStore } from './storeMapper';

export const storeApi = {
  createStore(body: CreateStoreRequest): Promise<MyStore> {
    return apiClient.post<StoreResponse>('/api/stores', body).then(mapMyStore);
  },

  async getMyStore(): Promise<MyStore | null> {
    try {
      return await apiClient
        .get<StoreResponse>('/api/stores/me')
        .then(mapMyStore);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'STORE_NOT_FOUND') {
        return null;
      }
      throw error;
    }
  },
};
