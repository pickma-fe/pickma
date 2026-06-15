import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceRoleClient } from '@/lib/supabase/service';

import { recordProductView } from './view-service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

function createSupabaseMock(params?: {
  latestView?: { viewed_at: string } | null;
  latestViewError?: object | null;
  product?: { store_id: string; category_id: string | null } | null;
  productError?: object | null;
  insertError?: object | null;
}) {
  const viewQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: params?.latestView ?? null,
      error: params?.latestViewError ?? null,
    }),
  };
  viewQuery.select.mockReturnValue(viewQuery);
  viewQuery.eq.mockReturnValue(viewQuery);
  viewQuery.order.mockReturnValue(viewQuery);
  viewQuery.limit.mockReturnValue(viewQuery);

  const productQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue({
      data: params?.product ?? {
        store_id: '00000000-0000-4000-8000-000000000031',
        category_id: '00000000-0000-4000-8000-000000000011',
      },
      error: params?.productError ?? null,
    }),
  };
  productQuery.select.mockReturnValue(productQuery);
  productQuery.eq.mockReturnValue(productQuery);

  const insert = vi.fn().mockResolvedValue({
    error: params?.insertError ?? null,
  });

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === 'product_view_events') {
        return {
          ...viewQuery,
          insert,
        };
      }

      if (table === 'products') {
        return productQuery;
      }

      throw new Error(`unexpected table: ${table}`);
    }),
  };

  return { supabase, insert };
}

describe('recordProductView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('30분 이내 동일 상품 조회 이력이 있으면 새 이벤트를 저장하지 않는다', async () => {
    const latestView = {
      viewed_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    };
    const { supabase, insert } = createSupabaseMock({ latestView });
    vi.mocked(createServiceRoleClient).mockReturnValue(supabase as never);

    const result = await recordProductView('user-1', 'product-1');

    expect(result).toBe(false);
    expect(insert).not.toHaveBeenCalled();
  });

  it('30분이 지난 동일 상품 조회면 새 이벤트를 저장한다', async () => {
    const latestView = {
      viewed_at: new Date(Date.now() - 31 * 60 * 1000).toISOString(),
    };
    const { supabase, insert } = createSupabaseMock({ latestView });
    vi.mocked(createServiceRoleClient).mockReturnValue(supabase as never);

    const result = await recordProductView('user-1', 'product-1');

    expect(result).toBe(true);
    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      product_id: 'product-1',
      store_id: '00000000-0000-4000-8000-000000000031',
      category_id: '00000000-0000-4000-8000-000000000011',
    });
  });

  it('기존 조회 이력이 없으면 새 이벤트를 저장한다', async () => {
    const { supabase, insert } = createSupabaseMock({ latestView: null });
    vi.mocked(createServiceRoleClient).mockReturnValue(supabase as never);

    const result = await recordProductView('user-1', 'product-1');

    expect(result).toBe(true);
    expect(insert).toHaveBeenCalledOnce();
  });
});
