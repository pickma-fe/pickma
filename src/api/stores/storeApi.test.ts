import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MyStore } from '@/types/store';
import type { StoreResponse } from '@/contracts/store';

import { ApiError, apiClient } from '../apiClient';
import { storeApi } from './storeApi';
import { mapMyStore } from './storeMapper';

vi.mock('../apiClient', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

vi.mock('./storeMapper', () => ({
  mapMyStore: vi.fn(),
}));

const mockStoreResponse: StoreResponse = {
  id: 'store-1',
  userId: 'user-1',
  name: '픽마 베이커리',
  businessNumber: '123-45-67890',
  phone: '02-1234-5678',
  address: '서울시 마포구 월드컵북로 12',
  region: '서울 마포구',
  status: 'approved',
  canSell: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockMyStore: MyStore = {
  id: 'store-1',
  userId: 'user-1',
  name: '픽마 베이커리',
  businessNumber: '123-45-67890',
  phone: '02-1234-5678',
  address: '서울시 마포구 월드컵북로 12',
  region: '서울 마포구',
  status: 'approved',
  canSell: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('storeApi.getMyStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapMyStore).mockReturnValue(mockMyStore);
  });

  it('정상 응답은 mapMyStore 결과를 반환한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockStoreResponse);
    const result = await storeApi.getMyStore();
    expect(mapMyStore).toHaveBeenCalledWith(mockStoreResponse);
    expect(result).toBe(mockMyStore);
  });

  it('STORE_NOT_FOUND ApiError는 null을 반환한다', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new ApiError(404, 'STORE_NOT_FOUND', '가게를 찾을 수 없습니다.')
    );
    const result = await storeApi.getMyStore();
    expect(result).toBeNull();
  });

  it('다른 ApiError는 rethrow한다', async () => {
    const error = new ApiError(401, 'UNAUTHORIZED', '인증이 필요합니다.');
    vi.mocked(apiClient.get).mockRejectedValue(error);
    await expect(storeApi.getMyStore()).rejects.toBe(error);
  });
});
