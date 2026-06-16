import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServerClient } from '@/lib/supabase/server';
import { getOrCreateUserByAuthUser } from '@/app/api/_lib/current-user';

import { POST } from './route';
import { recordProductView } from '../../_lib/view-service';

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('@/app/api/_lib/current-user', () => ({
  getOrCreateUserByAuthUser: vi.fn(),
}));

vi.mock('../../_lib/view-service', () => ({
  recordProductView: vi.fn(),
}));

const PRODUCT_ID = '00000000-0000-4000-8000-000000000051';

function makeCtx(productId: string) {
  return { params: Promise.resolve({ productId }) };
}

describe('POST /api/products/[productId]/view', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('상품 ID가 UUID가 아니면 400을 반환한다', async () => {
    const res = await POST(new Request('http://localhost'), makeCtx('invalid'));

    expect(res.status).toBe(400);
  });

  it('비로그인 사용자는 recorded=false를 반환한다', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never);

    const res = await POST(
      new Request('http://localhost'),
      makeCtx(PRODUCT_ID)
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ data: { recorded: false } });
    expect(recordProductView).not.toHaveBeenCalled();
  });

  it('로그인 사용자는 조회 이력 저장 결과를 반환한다', async () => {
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
    };
    vi.mocked(createServerClient).mockResolvedValue(supabase as never);
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue({
      id: 'user-1',
      status: 'active',
    } as never);
    vi.mocked(recordProductView).mockResolvedValue(true);

    const res = await POST(
      new Request('http://localhost'),
      makeCtx(PRODUCT_ID)
    );

    expect(res.status).toBe(200);
    expect(getOrCreateUserByAuthUser).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({ id: 'user-1' })
    );
    expect(recordProductView).toHaveBeenCalledWith('user-1', PRODUCT_ID);
    expect(await res.json()).toMatchObject({ data: { recorded: true } });
  });

  it('inactive 사용자는 조회 이력을 저장하지 않고 recorded=false를 반환한다', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
    } as never);
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue({
      id: 'user-1',
      status: 'suspended',
    } as never);

    const res = await POST(
      new Request('http://localhost'),
      makeCtx(PRODUCT_ID)
    );

    expect(res.status).toBe(200);
    expect(recordProductView).not.toHaveBeenCalled();
    expect(await res.json()).toMatchObject({ data: { recorded: false } });
  });

  it('저장 중 PRODUCT_NOT_FOUND가 발생하면 404를 반환한다', async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
    } as never);
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue({
      id: 'user-1',
      status: 'active',
    } as never);
    vi.mocked(recordProductView).mockRejectedValue(
      new AppError(ERROR_CODE.PRODUCT_NOT_FOUND, 404)
    );

    const res = await POST(
      new Request('http://localhost'),
      makeCtx(PRODUCT_ID)
    );

    expect(res.status).toBe(404);
  });
});
