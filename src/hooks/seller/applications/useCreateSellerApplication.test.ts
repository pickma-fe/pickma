import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SellerApplication } from '@/types/seller-application';
import { queryKeys } from '@/lib/queryKeys';
import { fileApi } from '@/api/files/fileApi';
import { sellerApplicationApi } from '@/api/seller-applications/sellerApplicationApi';

import { useCreateSellerApplication } from './useCreateSellerApplication';

vi.mock('@/api/files/fileApi', () => ({
  fileApi: { uploadFile: vi.fn(), deleteFiles: vi.fn() },
}));

vi.mock('@/api/seller-applications/sellerApplicationApi', () => ({
  sellerApplicationApi: { createSellerApplication: vi.fn() },
}));

function makeFile(name: string): File {
  return new File(['content'], name, { type: 'application/pdf' });
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

const validInput = {
  businessNumber: '123-45-67890',
  companyName: '테스트 회사',
  representativeName: '홍길동',
  businessAddress: '서울특별시 강남구 테헤란로 123',
  businessType: '음식점',
  businessCategory: '한식',
  documentConsentAgreed: true,
  documents: {
    businessLicense: makeFile('business_license.pdf'),
    foodServicePermit: makeFile('food_service_permit.pdf'),
    bankAccount: makeFile('bank_account.pdf'),
  },
};

const mockApplication = { id: 'app-1' } as unknown as SellerApplication;

describe('useCreateSellerApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('3개 문서를 업로드한 뒤 createSellerApplication을 올바른 body로 호출한다', async () => {
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File, o: object) => Promise<string>
    )
      .mockResolvedValueOnce('path/business_license')
      .mockResolvedValueOnce('path/food_service_permit')
      .mockResolvedValueOnce('path/bank_account');
    vi.mocked(sellerApplicationApi.createSellerApplication).mockResolvedValue(
      mockApplication
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateSellerApplication(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(validInput);
    });

    expect(fileApi.uploadFile).toHaveBeenCalledTimes(3);
    expect(fileApi.uploadFile).toHaveBeenCalledWith(
      'seller_application_document',
      validInput.documents.businessLicense,
      { documentType: 'business_license' }
    );
    expect(sellerApplicationApi.createSellerApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        businessNumber: validInput.businessNumber,
        documentConsentAgreed: true,
        documents: expect.arrayContaining([
          expect.objectContaining({
            type: 'business_license',
            storagePath: 'path/business_license',
            originalFileName: 'business_license.pdf',
            contentType: 'application/pdf',
          }),
          expect.objectContaining({
            type: 'food_service_permit',
            storagePath: 'path/food_service_permit',
          }),
          expect.objectContaining({
            type: 'bank_account',
            storagePath: 'path/bank_account',
          }),
        ]),
      })
    );
  });

  it('uploadFile 실패 시 createSellerApplication을 호출하지 않는다', async () => {
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File, o: object) => Promise<string>
    ).mockRejectedValue(new Error('UPLOAD_FAILED'));
    vi.mocked(fileApi.deleteFiles).mockResolvedValue(undefined);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateSellerApplication(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(validInput).catch(() => undefined);
    });

    expect(sellerApplicationApi.createSellerApplication).not.toHaveBeenCalled();
  });

  it('업로드 일부 실패 시 성공한 파일 경로로 deleteFiles를 호출한다', async () => {
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File, o: object) => Promise<string>
    )
      .mockResolvedValueOnce('path/business_license')
      .mockRejectedValueOnce(new Error('UPLOAD_FAILED'))
      .mockResolvedValueOnce('path/bank_account');
    vi.mocked(fileApi.deleteFiles).mockResolvedValue(undefined);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateSellerApplication(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(validInput).catch(() => undefined);
    });

    expect(fileApi.deleteFiles).toHaveBeenCalledWith(
      expect.arrayContaining(['path/business_license', 'path/bank_account'])
    );
    expect(sellerApplicationApi.createSellerApplication).not.toHaveBeenCalled();
  });

  it('createSellerApplication 실패 시 업로드된 파일 경로로 deleteFiles를 호출한다', async () => {
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File, o: object) => Promise<string>
    )
      .mockResolvedValueOnce('path/business_license')
      .mockResolvedValueOnce('path/food_service_permit')
      .mockResolvedValueOnce('path/bank_account');
    vi.mocked(sellerApplicationApi.createSellerApplication).mockRejectedValue(
      new Error('API_FAILED')
    );
    vi.mocked(fileApi.deleteFiles).mockResolvedValue(undefined);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateSellerApplication(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(validInput).catch(() => undefined);
    });

    expect(fileApi.deleteFiles).toHaveBeenCalledWith(
      expect.arrayContaining([
        'path/business_license',
        'path/food_service_permit',
        'path/bank_account',
      ])
    );
  });

  it('deleteFiles 실패 시 원래 에러를 그대로 전파한다', async () => {
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File, o: object) => Promise<string>
    ).mockResolvedValue('path/file');
    vi.mocked(sellerApplicationApi.createSellerApplication).mockRejectedValue(
      new Error('API_FAILED')
    );
    vi.mocked(fileApi.deleteFiles).mockRejectedValue(
      new Error('CLEANUP_FAILED')
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateSellerApplication(), {
      wrapper,
    });

    let thrownError: Error | undefined;
    await act(async () => {
      await result.current
        .mutateAsync(validInput)
        .catch((e: Error) => (thrownError = e));
    });

    expect(thrownError?.message).toBe('API_FAILED');
  });

  it('상위에서 받은 서류 동의값을 덮어쓰지 않는다', async () => {
    // false는 API schema에서 거부되는 값이며, 이 테스트는 hook이
    // 사용자 선택값을 임의로 true로 바꾸지 않는지만 검증한다.
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File, o: object) => Promise<string>
    ).mockResolvedValue('mock-path');
    vi.mocked(sellerApplicationApi.createSellerApplication).mockResolvedValue(
      mockApplication
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateSellerApplication(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        ...validInput,
        documentConsentAgreed: false,
      });
    });

    expect(sellerApplicationApi.createSellerApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        documentConsentAgreed: false,
      })
    );
  });

  it('성공 시 seller.onboardingStatus 쿼리를 무효화한다', async () => {
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File, o: object) => Promise<string>
    ).mockResolvedValue('mock-path');
    vi.mocked(sellerApplicationApi.createSellerApplication).mockResolvedValue(
      mockApplication
    );

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateSellerApplication(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(validInput);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.seller.onboardingStatus(),
    });
  });
});
