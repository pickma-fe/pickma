import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SellerApplicationResponse } from '@/contracts/seller-application';

import { apiClient } from '../apiClient';
import { sellerApplicationApi } from './sellerApplicationApi';
import { mapSellerApplication } from './sellerApplicationMapper';

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

vi.mock('./sellerApplicationMapper', () => ({
  mapSellerApplication: vi.fn(),
}));

const MOCK_RESPONSE: SellerApplicationResponse = {
  id: 'app-1',
  userId: 'user-1',
  status: 'pending',
  businessNumber: '123-45-67890',
  companyName: '테스트 주식회사',
  representativeName: '홍길동',
  businessAddress: '서울시 강남구',
  businessType: '소매업',
  businessCategory: '식품',
  documentConsentAgreed: true,
  documentConsentAgreedAt: '2026-05-01T00:00:00Z',
  documents: [],
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};

describe('sellerApplicationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createSellerApplication은 post 후 mapSellerApplication 결과를 반환한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(MOCK_RESPONSE);
    const mockMapped = { id: 'app-1' } as ReturnType<
      typeof mapSellerApplication
    >;
    vi.mocked(mapSellerApplication).mockReturnValue(mockMapped);

    const body = {
      businessNumber: '123-45-67890',
      companyName: '테스트 주식회사',
      representativeName: '홍길동',
      businessAddress: '서울시 강남구',
      businessType: '소매업',
      businessCategory: '식품',
      documentConsentAgreed: true,
      documents: [],
    };

    const result = await sellerApplicationApi.createSellerApplication(body);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/seller-applications',
      body
    );
    expect(mapSellerApplication).toHaveBeenCalledWith(MOCK_RESPONSE);
    expect(result).toBe(mockMapped);
  });
});
