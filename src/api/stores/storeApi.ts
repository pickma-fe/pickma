import type {
  CreateStoreInput,
  MyStore,
  UpdateStoreInput,
} from '@/types/store';
import type {
  CreateStoreRequest,
  StoreResponse,
  UpdateStoreRequest,
} from '@/contracts/store';

import { ApiError, apiClient } from '../apiClient';
import { mapMyStore } from './storeMapper';

function toCreateStoreRequest(input: CreateStoreInput): CreateStoreRequest {
  return { ...input };
}

function toUpdateStoreRequest(input: UpdateStoreInput): UpdateStoreRequest {
  return { ...input };
}

export const storeApi = {
  createStore(input: CreateStoreInput): Promise<MyStore> {
    return apiClient
      .post<StoreResponse>('/api/stores', toCreateStoreRequest(input))
      .then(mapMyStore);
  },

  updateStore(input: UpdateStoreInput): Promise<MyStore> {
    return apiClient
      .patch<StoreResponse>('/api/stores/me', toUpdateStoreRequest(input))
      .then(mapMyStore);
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
