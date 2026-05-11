import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceRoleClient } from '@/lib/supabase/service';
import {
  buildOrderName,
  mapCreateOrderResponse,
} from '@/app/api/orders/_lib/mapper';

import { createOrder, expireUserOrders } from './service';

vi.mock('@/lib/supabase/service');
vi.mock('@/app/api/orders/_lib/mapper');

const mockExpiresAt = '2026-05-11T10:10:00.000Z';

const mockRpcResult = [
  {
    order_id: 'order-1',
    order_number: 'PM20260511A1B2C3D4E5',
    payment_amount: 7200,
  },
];

const mockItems = [{ product_name: '크루아상', quantity: 2 }];

const mockCreateOrderResponse = {
  id: 'order-1',
  orderNumber: 'PM20260511A1B2C3D4E5',
  orderName: '크루아상 2개',
  paymentAmount: 7200,
  expiresAt: mockExpiresAt,
};

function makeClient({
  rpcResult = mockRpcResult,
  rpcError = null as { message: string } | null,
  itemsResult = mockItems,
  itemsError = null as { message: string } | null,
} = {}) {
  const rpcFn = vi.fn().mockResolvedValue({ data: rpcResult, error: rpcError });
  const client = {
    rpc: rpcFn,
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'order_items') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockResolvedValue({ data: itemsResult, error: itemsError }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    }),
  };
  return { client, rpcFn };
}

describe('createOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildOrderName).mockReturnValue('크루아상 2개');
    vi.mocked(mapCreateOrderResponse).mockReturnValue(mockCreateOrderResponse);
  });

  it('성공 시 CreateOrderResponse를 반환하고 RPC를 올바른 인수로 호출한다', async () => {
    const { client, rpcFn } = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    const body = {
      productId: 'product-uuid-1234',
      quantity: 2,
      pickupAt: '2026-05-11T11:00:00.000Z',
    };

    const result = await createOrder('user-1', body);

    expect(rpcFn).toHaveBeenCalledWith('create_order', {
      p_user_id: 'user-1',
      p_items: [{ product_id: 'product-uuid-1234', quantity: 2 }],
      p_pickup_at: '2026-05-11T11:00:00.000Z',
      p_expires_at: expect.any(String),
    });
    expect(result).toBe(mockCreateOrderResponse);
  });

  it('expiresAt이 now + 10분으로 설정된다', async () => {
    const before = Date.now();
    const { client } = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await createOrder('user-1', {
      productId: 'product-1',
      quantity: 1,
      pickupAt: '2026-05-11T11:00:00.000Z',
    });
    const after = Date.now();

    const callArgs = vi.mocked(mapCreateOrderResponse).mock.calls[0][0];
    const expiresAtMs = new Date(callArgs.expiresAt).getTime();
    expect(expiresAtMs).toBeGreaterThanOrEqual(before + 10 * 60 * 1000);
    expect(expiresAtMs).toBeLessThanOrEqual(after + 10 * 60 * 1000);
  });

  it('RPC PRODUCT_NOT_FOUND → AppError PRODUCT_NOT_FOUND 404', async () => {
    const { client } = makeClient({
      rpcResult: null as never,
      rpcError: { message: 'PRODUCT_NOT_FOUND' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'p',
        quantity: 1,
        pickupAt: '2026-05-11T11:00:00.000Z',
      })
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND', statusCode: 404 });
  });

  // create_order RPC는 SECURITY DEFINER + service_role로 RLS를 우회하므로,
  // RPC 내부에서 stores.status = 'approved' JOIN으로 직접 검증한다.
  // 미승인 매장 상품은 RPC가 NOT FOUND로 처리 → PRODUCT_NOT_FOUND 404.
  it('미승인 매장 소속 상품 → AppError PRODUCT_NOT_FOUND 404', async () => {
    const { client } = makeClient({
      rpcResult: null as never,
      rpcError: { message: 'PRODUCT_NOT_FOUND' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'unapproved-store-product-uuid',
        quantity: 1,
        pickupAt: '2026-05-11T11:00:00.000Z',
      })
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND', statusCode: 404 });
  });

  it('RPC PRODUCT_EXPIRED → AppError PRODUCT_EXPIRED 409', async () => {
    const { client } = makeClient({
      rpcResult: null as never,
      rpcError: { message: 'PRODUCT_EXPIRED' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'p',
        quantity: 1,
        pickupAt: '2026-05-11T11:00:00.000Z',
      })
    ).rejects.toMatchObject({ code: 'PRODUCT_EXPIRED', statusCode: 409 });
  });

  it('RPC PRODUCT_NOT_AVAILABLE → AppError PRODUCT_NOT_AVAILABLE 409', async () => {
    const { client } = makeClient({
      rpcResult: null as never,
      rpcError: { message: 'PRODUCT_NOT_AVAILABLE' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'p',
        quantity: 1,
        pickupAt: '2026-05-11T11:00:00.000Z',
      })
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_AVAILABLE', statusCode: 409 });
  });

  it('RPC OUT_OF_STOCK → AppError OUT_OF_STOCK 409', async () => {
    const { client } = makeClient({
      rpcResult: null as never,
      rpcError: { message: 'OUT_OF_STOCK' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'p',
        quantity: 1,
        pickupAt: '2026-05-11T11:00:00.000Z',
      })
    ).rejects.toMatchObject({ code: 'OUT_OF_STOCK', statusCode: 409 });
  });

  it('RPC INVALID_PICKUP_TIME → AppError VALIDATION_ERROR 400 with details.path = pickupAt', async () => {
    const { client } = makeClient({
      rpcResult: null as never,
      rpcError: { message: 'INVALID_PICKUP_TIME' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'p',
        quantity: 1,
        pickupAt: '2026-05-11T11:00:00.000Z',
      })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: [{ path: 'pickupAt' }],
    });
  });

  it('RPC ORDER_NUMBER_EXHAUSTED → AppError ORDER_NUMBER_EXHAUSTED 503', async () => {
    const { client } = makeClient({
      rpcResult: null as never,
      rpcError: { message: 'ORDER_NUMBER_EXHAUSTED' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'p',
        quantity: 1,
        pickupAt: '2026-05-11T11:00:00.000Z',
      })
    ).rejects.toMatchObject({
      code: 'ORDER_NUMBER_EXHAUSTED',
      statusCode: 503,
    });
  });

  it('RPC DUPLICATE_PRODUCT_IN_ORDER → AppError DUPLICATE_PRODUCT_IN_ORDER 400', async () => {
    const { client } = makeClient({
      rpcResult: null as never,
      rpcError: { message: 'DUPLICATE_PRODUCT_IN_ORDER' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'p',
        quantity: 1,
        pickupAt: '2026-05-11T11:00:00.000Z',
      })
    ).rejects.toMatchObject({
      code: 'DUPLICATE_PRODUCT_IN_ORDER',
      statusCode: 400,
    });
  });

  it('order_items 조회 실패 → AppError INTERNAL_SERVER_ERROR 500', async () => {
    const { client } = makeClient({
      itemsResult: null as never,
      itemsError: { message: 'DB error' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'p',
        quantity: 1,
        pickupAt: '2026-05-11T11:00:00.000Z',
      })
    ).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR', statusCode: 500 });
  });

  it('order_items 빈 결과 → AppError INTERNAL_SERVER_ERROR 500', async () => {
    const { client } = makeClient({ itemsResult: [] });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'p',
        quantity: 1,
        pickupAt: '2026-05-11T11:00:00.000Z',
      })
    ).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR', statusCode: 500 });
  });
});

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
