import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceRoleClient } from '@/lib/supabase/service';

import { expireUserOrders } from './order-expiration';

vi.mock('@/lib/supabase/service');

describe('expireUserOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('만료된 주문 있으면 expire_order RPC를 N번 호출한다', async () => {
    const expiredOrders = [{ id: 'order-1' }, { id: 'order-2' }];
    const rpcFn = vi.fn().mockResolvedValue({ data: null, error: null });
    const client = {
      rpc: rpcFn,
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: expiredOrders, error: null }),
      }),
    };
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expireUserOrders('user-1');

    expect(rpcFn).toHaveBeenCalledTimes(2);
    expect(rpcFn).toHaveBeenCalledWith('expire_order', {
      p_order_id: 'order-1',
    });
    expect(rpcFn).toHaveBeenCalledWith('expire_order', {
      p_order_id: 'order-2',
    });
  });

  it('만료된 주문 없으면 expire_order 호출 없음', async () => {
    const rpcFn = vi.fn();
    const client = {
      rpc: rpcFn,
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    };
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expireUserOrders('user-1');

    expect(rpcFn).not.toHaveBeenCalled();
  });

  it('만료 주문 조회 실패 시 throw 없이 종료한다', async () => {
    const client = {
      rpc: vi.fn(),
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    };
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(expireUserOrders('user-1')).resolves.toBeUndefined();
  });

  it('개별 expire_order 실패해도 throw 없이 다음 주문 cleanup 계속 시도한다', async () => {
    const expiredOrders = [{ id: 'order-1' }, { id: 'order-2' }];
    const rpcFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('RPC error'))
      .mockResolvedValueOnce({ data: null, error: null });
    const client = {
      rpc: rpcFn,
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: expiredOrders, error: null }),
      }),
    };
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(expireUserOrders('user-1')).resolves.toBeUndefined();
    expect(rpcFn).toHaveBeenCalledTimes(2);
  });
});
