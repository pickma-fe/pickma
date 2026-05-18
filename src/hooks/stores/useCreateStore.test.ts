import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MyStore } from '@/types/store';
import { fileApi } from '@/api/files/fileApi';
import { storeApi } from '@/api/stores/storeApi';

import { useCreateStore } from './useCreateStore';

vi.mock('@/api/files/fileApi', () => ({
  fileApi: { uploadFile: vi.fn() },
}));

vi.mock('@/api/stores/storeApi', () => ({
  storeApi: { createStore: vi.fn() },
}));

function makeFile(name: string): File {
  return new File(['content'], name, { type: 'image/jpeg' });
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
  name: '픽마 베이커리',
  businessNumber: '123-45-67890',
  phone: '02-1234-5678',
  address: '서울시 마포구 월드컵북로 12',
  region: '서울 마포구',
};

const mockStore = {
  id: 'store-1',
  name: '픽마 베이커리',
  status: 'approved',
  canSell: true,
} as MyStore;

describe('useCreateStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('imageFile 없으면 uploadFile 없이 createStore를 호출한다', async () => {
    vi.mocked(storeApi.createStore).mockResolvedValue(mockStore);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateStore(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(validInput);
    });

    expect(fileApi.uploadFile).not.toHaveBeenCalled();
    expect(storeApi.createStore).toHaveBeenCalledWith(
      expect.objectContaining({ name: '픽마 베이커리', image: undefined })
    );
  });

  it('imageFile 있으면 uploadFile 후 storagePath를 image로 전달한다', async () => {
    const storagePath = 'stores/image.jpg';
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File) => Promise<string>
    ).mockResolvedValue(storagePath);
    vi.mocked(storeApi.createStore).mockResolvedValue(mockStore);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateStore(), { wrapper });

    const imageFile = makeFile('store.jpg');
    await act(async () => {
      await result.current.mutateAsync({ ...validInput, imageFile });
    });

    expect(fileApi.uploadFile).toHaveBeenCalledWith('store_image', imageFile);
    expect(storeApi.createStore).toHaveBeenCalledWith(
      expect.objectContaining({ image: storagePath })
    );
  });

  it('uploadFile 실패 시 createStore를 호출하지 않는다', async () => {
    vi.mocked(
      fileApi.uploadFile as (p: string, f: File) => Promise<string>
    ).mockRejectedValue(new Error('upload failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateStore(), { wrapper });

    const imageFile = makeFile('store.jpg');
    await act(async () => {
      await result.current
        .mutateAsync({ ...validInput, imageFile })
        .catch(() => undefined);
    });

    expect(storeApi.createStore).not.toHaveBeenCalled();
  });

  it('성공 시 stores/my와 users/me 쿼리를 invalidate한다', async () => {
    vi.mocked(storeApi.createStore).mockResolvedValue(mockStore);

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateStore(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(validInput);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['stores', 'my'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users', 'me'] });
  });
});
