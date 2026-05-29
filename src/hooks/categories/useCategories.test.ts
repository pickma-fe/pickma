import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Category } from '@/types/category';
import { categoryApi } from '@/api/categories/categoryApi';

import { useCategories } from './useCategories';

vi.mock('@/api/categories/categoryApi');

const mockCategories: Category[] = [
  {
    id: '00000000-0000-4000-8000-000000000011',
    name: '베이커리',
    icon: 'bread',
    sortOrder: 1,
  },
];

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  }
  return Wrapper;
}

describe('useCategories', () => {
  beforeEach(() => {
    vi.mocked(categoryApi.getCategories).mockReset();
  });

  it('categoryApi.getCategories를 호출하고 결과를 반환한다', async () => {
    vi.mocked(categoryApi.getCategories).mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(categoryApi.getCategories).toHaveBeenCalledTimes(1);
    expect(result.current.data?.[0].id).toBe(mockCategories[0].id);
  });

  it('initialData가 있으면 mount 직후 refetch하지 않고 초기 데이터를 사용한다', async () => {
    const { result } = renderHook(
      () =>
        useCategories({
          initialData: mockCategories,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0].id).toBe(mockCategories[0].id);
    expect(categoryApi.getCategories).not.toHaveBeenCalled();
  });
});
