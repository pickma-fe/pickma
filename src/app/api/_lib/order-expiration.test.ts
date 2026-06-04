import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServerClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { expireUserOrders } from './order-expiration';

vi.mock('@/lib/supabase/server');
vi.mock('@/lib/supabase/service');

describe('expireUserOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeServerClient(orders: { id: string }[] | null, error?: object) {
    return {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: orders, error: error ?? null }),
      }),
    };
  }

  it('만료된 주문 있으면 expire_order RPC를 N번 호출한다', async () => {
    const expiredOrders = [{ id: 'order-1' }, { id: 'order-2' }];
    vi.mocked(createServerClient).mockResolvedValue(
      makeServerClient(expiredOrders) as never
    );
    const rpcFn = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.mocked(createServiceRoleClient).mockReturnValue({
      rpc: rpcFn,
    } as never);

    await expireUserOrders();

    expect(rpcFn).toHaveBeenCalledTimes(2);
    expect(rpcFn).toHaveBeenCalledWith('expire_order', {
      p_order_id: 'order-1',
    });
    expect(rpcFn).toHaveBeenCalledWith('expire_order', {
      p_order_id: 'order-2',
    });
  });

  it('만료된 주문 없으면 expire_order 호출 없음', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeServerClient([]) as never
    );
    const rpcFn = vi.fn();
    vi.mocked(createServiceRoleClient).mockReturnValue({
      rpc: rpcFn,
    } as never);

    await expireUserOrders();

    expect(rpcFn).not.toHaveBeenCalled();
  });

  it('만료 주문 조회 실패 시 throw 없이 종료한다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeServerClient(null, { message: 'DB error' }) as never
    );
    vi.mocked(createServiceRoleClient).mockReturnValue({
      rpc: vi.fn(),
    } as never);

    await expect(expireUserOrders()).resolves.toBeUndefined();
  });

  it('개별 expire_order throw 실패해도 throw 없이 다음 주문 cleanup 계속 시도한다', async () => {
    const expiredOrders = [{ id: 'order-1' }, { id: 'order-2' }];
    vi.mocked(createServerClient).mockResolvedValue(
      makeServerClient(expiredOrders) as never
    );
    const rpcFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('RPC error'))
      .mockResolvedValueOnce({ data: null, error: null });
    vi.mocked(createServiceRoleClient).mockReturnValue({
      rpc: rpcFn,
    } as never);

    await expect(expireUserOrders()).resolves.toBeUndefined();
    expect(rpcFn).toHaveBeenCalledTimes(2);
  });

  it('개별 expire_order error 필드 반환해도 throw 없이 다음 주문 cleanup 계속 시도한다', async () => {
    const expiredOrders = [{ id: 'order-1' }, { id: 'order-2' }];
    vi.mocked(createServerClient).mockResolvedValue(
      makeServerClient(expiredOrders) as never
    );
    const rpcFn = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })
      .mockResolvedValueOnce({ data: null, error: null });
    vi.mocked(createServiceRoleClient).mockReturnValue({
      rpc: rpcFn,
    } as never);

    await expect(expireUserOrders()).resolves.toBeUndefined();
    expect(rpcFn).toHaveBeenCalledTimes(2);
  });
});
