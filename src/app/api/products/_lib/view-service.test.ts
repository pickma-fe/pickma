import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { recordProductView } from './view-service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

function createSupabaseMock(params?: {
  data?: boolean | null;
  error?: { message?: string } | null;
}) {
  return {
    rpc: vi.fn().mockResolvedValue({
      data: params?.data ?? true,
      error: params?.error ?? null,
    }),
  };
}

describe('recordProductView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RPC가 false를 반환하면 30분 이내 중복 조회로 처리한다', async () => {
    const supabase = createSupabaseMock({ data: false });
    vi.mocked(createServiceRoleClient).mockReturnValue(supabase as never);

    const result = await recordProductView('user-1', 'product-1');

    expect(result).toBe(false);
    expect(supabase.rpc).toHaveBeenCalledWith('record_product_view', {
      p_user_id: 'user-1',
      p_product_id: 'product-1',
    });
  });

  it('RPC가 true를 반환하면 조회 이력을 저장한다', async () => {
    const supabase = createSupabaseMock({ data: true });
    vi.mocked(createServiceRoleClient).mockReturnValue(supabase as never);

    const result = await recordProductView('user-1', 'product-1');

    expect(result).toBe(true);
  });

  it('PRODUCT_NOT_FOUND 에러는 404 AppError로 변환한다', async () => {
    const supabase = createSupabaseMock({
      error: { message: 'PRODUCT_NOT_FOUND' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(supabase as never);

    await expect(recordProductView('user-1', 'product-1')).rejects.toEqual(
      new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404)
    );
  });
});
