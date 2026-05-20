import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SellerApplication } from '@/types/seller-application';
import { fileApi } from '@/api/files/fileApi';
import { sellerApplicationApi } from '@/api/seller-applications/sellerApplicationApi';

import { useCreateSellerApplication } from './useCreateSellerApplication';

vi.mock('@/api/files/fileApi', () => ({
  fileApi: { uploadFile: vi.fn() },
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
  documents: {
    businessLicense: makeFile('business_license.pdf'),
    idCard: makeFile('id_card.pdf'),
    bankbook: makeFile('bankbook.pdf'),
    businessReport: makeFile('business_report.pdf'),
  },
};

const mockApplication = { id: 'app-1' } as unknown as SellerApplication;

describe('useCreateSellerApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('4개 문서를 업로드한 뒤 createSellerApplication을 올바른 body로 호출한다', async () => {
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File, o: object) => Promise<string>
    )
      .mockResolvedValueOnce('path/business_license')
      .mockResolvedValueOnce('path/id_card')
      .mockResolvedValueOnce('path/bankbook')
      .mockResolvedValueOnce('path/business_report');
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

    expect(fileApi.uploadFile).toHaveBeenCalledTimes(4);
    expect(fileApi.uploadFile).toHaveBeenCalledWith(
      'seller_application_document',
      validInput.documents.businessLicense,
      { documentType: 'business_license' }
    );
    expect(sellerApplicationApi.createSellerApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        businessNumber: validInput.businessNumber,
        documents: expect.arrayContaining([
          expect.objectContaining({
            type: 'business_license',
            storagePath: 'path/business_license',
            originalFileName: 'business_license.pdf',
            contentType: 'application/pdf',
          }),
          expect.objectContaining({
            type: 'id_card',
            storagePath: 'path/id_card',
          }),
          expect.objectContaining({
            type: 'bankbook',
            storagePath: 'path/bankbook',
          }),
          expect.objectContaining({
            type: 'business_report',
            storagePath: 'path/business_report',
          }),
        ]),
      })
    );
  });

  it('uploadFile 실패 시 createSellerApplication을 호출하지 않는다', async () => {
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File, o: object) => Promise<string>
    ).mockRejectedValue(new Error('UPLOAD_FAILED'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateSellerApplication(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(validInput).catch(() => undefined);
    });

    expect(sellerApplicationApi.createSellerApplication).not.toHaveBeenCalled();
  });

  it('성공 시 onboarding-status 쿼리를 무효화한다', async () => {
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
      queryKey: ['sellers', 'onboarding-status'],
    });
  });
});
