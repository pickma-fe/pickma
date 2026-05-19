import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SellerOnboardingStatusResponse } from '@/contracts/seller-application';

import { sellerOnboardingApi } from './sellerOnboardingApi';
import { apiClient } from '../../apiClient';

vi.mock('../../apiClient', async (importOriginal) => {
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

const MOCK_RESPONSE: SellerOnboardingStatusResponse = {
  role: 'customer',
  applicationStatus: 'pending',
  hasStore: false,
};

describe('sellerOnboardingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSellerOnboardingStatus는 GET 후 domain 객체로 변환한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(MOCK_RESPONSE);

    const result = await sellerOnboardingApi.getSellerOnboardingStatus();
    expect(apiClient.get).toHaveBeenCalledWith('/api/seller/onboarding-status');
    expect(result.role).toBe('customer');
    expect(result.applicationStatus).toBe('pending');
    expect(result.hasStore).toBe(false);
  });

  it('latestRejectReason이 있으면 포함한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      ...MOCK_RESPONSE,
      applicationStatus: 'rejected',
      latestRejectReason: '서류 미비',
    });

    const result = await sellerOnboardingApi.getSellerOnboardingStatus();
    expect(result.latestRejectReason).toBe('서류 미비');
  });
});
