import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceRoleClient } from '@/lib/supabase/service';
import {
  buildOrderName,
  mapCreateOrderResponse,
  mapOrderDetailRow,
  mapOrderListRow,
} from '@/app/api/orders/_lib/mapper';

import { createOrder, getOrder, getOrders } from './service';

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
  // RPC 내부에서 stores.status = 'active' AND stores.operation_status = 'open' 조건으로 직접 검증한다.
  // inactive/closed 매장 상품은 RPC가 NOT FOUND로 처리 → PRODUCT_NOT_FOUND 404.
  it('inactive/closed 매장 소속 상품 → AppError PRODUCT_NOT_FOUND 404', async () => {
    const { client } = makeClient({
      rpcResult: null as never,
      rpcError: { message: 'PRODUCT_NOT_FOUND' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      createOrder('user-1', {
        productId: 'inactive-store-product-uuid',
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

const mockOrderListItem = {
  id: 'order-uuid-1',
  orderNumber: 'PM20260101A1B2C3D4E5',
  storeId: 'store-uuid-1',
  storeName: '크루아상 베이커리',
  totalAmount: 10000,
  discountAmount: 2000,
  paymentAmount: 8000,
  status: 'reserved' as const,
  pickupAt: '2026-05-12T10:00:00.000Z',
  pickupServiceDate: '2026-05-12',
  createdAt: '2026-05-12T08:00:00.000Z',
  updatedAt: '2026-05-12T08:00:00.000Z',
};

const mockOrderDetail = {
  ...mockOrderListItem,
  items: [],
};

const defaultParams = {
  page: 1,
  pageSize: 20,
  sort: 'createdAt' as const,
  order: 'desc' as const,
};

function makeListClient({
  rows = [{}],
  count = 1,
  error = null as { message: string } | null,
} = {}) {
  const rangeFn = vi.fn().mockResolvedValue({ data: rows, count, error });
  const orderFn = vi.fn().mockReturnValue({ range: rangeFn });
  const statusEqFn = vi.fn().mockReturnValue({ order: orderFn });
  const userEqFn = vi.fn().mockReturnValue({ eq: statusEqFn, order: orderFn });
  const selectFn = vi.fn().mockReturnValue({ eq: userEqFn });
  const client = {
    from: vi.fn().mockReturnValue({ select: selectFn }),
  };
  return { client, userEqFn, statusEqFn, orderFn, rangeFn };
}

function makeDetailClient({
  data = {},
  error = null as { message: string } | null,
}: { data?: object | null; error?: { message: string } | null } = {}) {
  const maybeSingleFn = vi.fn().mockResolvedValue({ data, error });
  const userEqFn = vi.fn().mockReturnValue({ maybeSingle: maybeSingleFn });
  const orderEqFn = vi.fn().mockReturnValue({ eq: userEqFn });
  const selectFn = vi.fn().mockReturnValue({ eq: orderEqFn });
  const client = {
    from: vi.fn().mockReturnValue({ select: selectFn }),
  };
  return { client, orderEqFn, userEqFn };
}

describe('getOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapOrderListRow).mockReturnValue(mockOrderListItem);
  });

  it('성공 시 userId 필터와 페이지네이션을 적용하고 OrderListResponse를 반환한다', async () => {
    const { client, userEqFn } = makeListClient({ rows: [{}], count: 1 });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    const result = await getOrders('user-1', defaultParams);

    expect(userEqFn).toHaveBeenCalledWith('user_id', 'user-1');
    expect(result.items).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('status 필터 있음: eq("status", ...) 호출', async () => {
    const { client, statusEqFn } = makeListClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await getOrders('user-1', { ...defaultParams, status: 'reserved' });

    expect(statusEqFn).toHaveBeenCalledWith('status', 'reserved');
  });

  it('status 필터 없음: eq("status") 미호출', async () => {
    const { client, statusEqFn } = makeListClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await getOrders('user-1', defaultParams);

    expect(statusEqFn).not.toHaveBeenCalledWith('status', expect.anything());
  });

  it('sort="pickupAt": pickup_at 기준 정렬', async () => {
    const { client, orderFn } = makeListClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await getOrders('user-1', { ...defaultParams, sort: 'pickupAt' });

    expect(orderFn).toHaveBeenCalledWith(
      'pickup_at',
      expect.objectContaining({ ascending: false })
    );
  });

  it('order="asc": ascending: true 전달', async () => {
    const { client, orderFn } = makeListClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await getOrders('user-1', { ...defaultParams, order: 'asc' });

    expect(orderFn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ ascending: true })
    );
  });

  it('Supabase error → INTERNAL_SERVER_ERROR 500', async () => {
    const { client } = makeListClient({
      rows: null as never,
      count: null as never,
      error: { message: 'DB error' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(getOrders('user-1', defaultParams)).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });

  it('빈 결과: items: [], totalCount: 0, totalPages: 0 반환', async () => {
    const { client } = makeListClient({ rows: [], count: 0 });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    const result = await getOrders('user-1', defaultParams);

    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

describe('getOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapOrderDetailRow).mockReturnValue(mockOrderDetail);
  });

  it('성공 시 올바른 userId, orderId 필터로 OrderDetailResponse를 반환한다', async () => {
    const { client, orderEqFn, userEqFn } = makeDetailClient({ data: {} });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    const result = await getOrder('user-1', 'order-uuid-1');

    expect(orderEqFn).toHaveBeenCalledWith('id', 'order-uuid-1');
    expect(userEqFn).toHaveBeenCalledWith('user_id', 'user-1');
    expect(result).toBe(mockOrderDetail);
  });

  it('주문 없음 (null) → ORDER_NOT_FOUND 404', async () => {
    const { client } = makeDetailClient({ data: null });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(getOrder('user-1', 'order-uuid-1')).rejects.toMatchObject({
      code: 'ORDER_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('다른 사용자 주문: user_id 필터로 null 반환 → ORDER_NOT_FOUND 404', async () => {
    const { client } = makeDetailClient({ data: null });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(getOrder('other-user', 'order-uuid-1')).rejects.toMatchObject({
      code: 'ORDER_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('Supabase error → INTERNAL_SERVER_ERROR 500', async () => {
    const { client } = makeDetailClient({
      data: null,
      error: { message: 'DB error' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(getOrder('user-1', 'order-uuid-1')).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });
});
