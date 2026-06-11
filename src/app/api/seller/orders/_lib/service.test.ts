import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import {
  acceptSellerOrder,
  completeSellerOrder,
  getSellerOrder,
  getSellerOrderSummary,
  getSellerOrders,
  markSellerOrderReady,
} from './service';

vi.mock('@/lib/supabase/service');

const STORE_ID = '00000000-0000-4000-8000-000000000031';
const ORDER_ID = '00000000-0000-4000-8000-000000000051';

const orderListRow = {
  id: ORDER_ID,
  order_number: 'PM20260519AAAA',
  store_id: STORE_ID,
  total_amount: 10000,
  discount_amount: 2000,
  payment_amount: 8000,
  status: 'reserved',
  pickup_at: '2026-05-19T10:00:00.000Z',
  pickup_service_date: '2026-05-19',
  store_order_number: 'S-001',
  pickup_number: 'P-001',
  expires_at: null,
  created_at: '2026-05-19T08:00:00.000Z',
  updated_at: '2026-05-19T08:00:00.000Z',
  stores: { name: '테스트 스토어' },
};

const orderDetailRow = {
  ...orderListRow,
  cancel_reason: null,
  cancelled_at: null,
  picked_up_at: null,
  order_items: [],
  payments: null,
};

function buildChain(result: {
  data?: unknown;
  count?: number | null;
  error?: object | null;
}) {
  const chain = {
    select: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    then: vi.fn(
      (
        onFulfilled?: (value: typeof result) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) => Promise.resolve(result).then(onFulfilled, onRejected)
    ),
  };
  chain.select.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.range.mockReturnValue(chain);
  return chain;
}

function mockServiceClient(client: object): void {
  vi.mocked(createServiceRoleClient).mockReturnValue(
    client as ReturnType<typeof createServiceRoleClient>
  );
}

describe('getSellerOrders', () => {
  beforeEach(() => vi.clearAllMocks());

  it('store_id 기준으로 paginated 목록을 반환한다', async () => {
    const chain = buildChain({ data: [orderListRow], count: 1, error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    const result = await getSellerOrders(STORE_ID, {
      page: 1,
      pageSize: 20,
      sort: 'createdAt',
      order: 'desc',
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(ORDER_ID);
    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('status 필터가 있으면 eq를 호출한다', async () => {
    const chain = buildChain({ data: [], count: 0, error: null });
    const client = { from: vi.fn().mockReturnValue(chain) };
    mockServiceClient(client);

    await getSellerOrders(STORE_ID, {
      page: 1,
      pageSize: 20,
      sort: 'createdAt',
      order: 'desc',
      status: 'accepted',
    });

    expect(chain.eq).toHaveBeenCalledWith('status', 'accepted');
  });

  it('supabase 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const chain = buildChain({ data: null, error: { message: 'db error' } });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    await expect(
      getSellerOrders(STORE_ID, {
        page: 1,
        pageSize: 20,
        sort: 'createdAt',
        order: 'desc',
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.INTERNAL_SERVER_ERROR });
  });
});

describe('getSellerOrderSummary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('store_id 기준으로 전체 count와 상태별 count를 반환한다', async () => {
    const totalChain = buildChain({ data: [], count: 12, error: null });
    const reservedChain = buildChain({ data: [], count: 3, error: null });
    const acceptedChain = buildChain({ data: [], count: 2, error: null });
    const readyChain = buildChain({ data: [], count: 1, error: null });
    const completedChain = buildChain({ data: [], count: 4, error: null });
    const cancellingChain = buildChain({ data: [], count: 1, error: null });
    const cancelledChain = buildChain({ data: [], count: 1, error: null });
    const noShowChain = buildChain({ data: [], count: 0, error: null });
    const expiredChain = buildChain({ data: [], count: 0, error: null });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(totalChain)
        .mockReturnValueOnce(reservedChain)
        .mockReturnValueOnce(acceptedChain)
        .mockReturnValueOnce(readyChain)
        .mockReturnValueOnce(completedChain)
        .mockReturnValueOnce(cancellingChain)
        .mockReturnValueOnce(cancelledChain)
        .mockReturnValueOnce(noShowChain)
        .mockReturnValueOnce(expiredChain),
    };
    mockServiceClient(client);

    const result = await getSellerOrderSummary(STORE_ID);

    expect(result).toEqual({
      totalCount: 12,
      statusCounts: {
        reserved: 3,
        accepted: 2,
        ready: 1,
        completed: 4,
        cancelling: 1,
        cancelled: 1,
        noShow: 0,
        expired: 0,
      },
    });
    expect(totalChain.eq).toHaveBeenCalledWith('store_id', STORE_ID);
    expect(reservedChain.eq).toHaveBeenCalledWith('status', 'reserved');
    expect(noShowChain.eq).toHaveBeenCalledWith('status', 'no_show');
  });

  it('count query 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const chain = buildChain({ data: null, error: { message: 'db error' } });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    await expect(getSellerOrderSummary(STORE_ID)).rejects.toMatchObject({
      code: ERROR_CODE.INTERNAL_SERVER_ERROR,
    });
  });
});

describe('getSellerOrder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('store_id + orderId 조건으로 단건을 반환한다', async () => {
    const chain = buildChain({ data: orderDetailRow, error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    const result = await getSellerOrder(STORE_ID, ORDER_ID);

    expect(result.id).toBe(ORDER_ID);
    expect(chain.eq).toHaveBeenCalledWith('id', ORDER_ID);
    expect(chain.eq).toHaveBeenCalledWith('store_id', STORE_ID);
  });

  it('데이터가 없으면 ORDER_NOT_FOUND를 던진다', async () => {
    const chain = buildChain({ data: null, error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    await expect(getSellerOrder(STORE_ID, ORDER_ID)).rejects.toMatchObject({
      code: ERROR_CODE.ORDER_NOT_FOUND,
    });
  });
});

describe('acceptSellerOrder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reserved → accepted 전이에 성공한다', async () => {
    const chain = buildChain({ data: [{ id: ORDER_ID }], error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    await expect(
      acceptSellerOrder(STORE_ID, ORDER_ID)
    ).resolves.toBeUndefined();
    expect(chain.update).toHaveBeenCalledWith({ status: 'accepted' });
    expect(chain.eq).toHaveBeenCalledWith('status', 'reserved');
  });

  it('주문이 없으면 ORDER_NOT_FOUND를 던진다', async () => {
    const updateChain = buildChain({ data: [], error: null });
    const selectChain = buildChain({ data: null, error: null });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(selectChain),
    };
    mockServiceClient(client);

    await expect(acceptSellerOrder(STORE_ID, ORDER_ID)).rejects.toMatchObject({
      code: ERROR_CODE.ORDER_NOT_FOUND,
    });
  });

  it('상태가 맞지 않으면 INVALID_ORDER_STATUS를 던진다', async () => {
    const updateChain = buildChain({ data: [], error: null });
    const selectChain = buildChain({ data: { id: ORDER_ID }, error: null });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(selectChain),
    };
    mockServiceClient(client);

    await expect(acceptSellerOrder(STORE_ID, ORDER_ID)).rejects.toMatchObject({
      code: ERROR_CODE.INVALID_ORDER_STATUS,
    });
  });
});

describe('markSellerOrderReady', () => {
  beforeEach(() => vi.clearAllMocks());

  it('accepted → ready 전이에 성공한다', async () => {
    const chain = buildChain({ data: [{ id: ORDER_ID }], error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    await expect(
      markSellerOrderReady(STORE_ID, ORDER_ID)
    ).resolves.toBeUndefined();
    expect(chain.update).toHaveBeenCalledWith({ status: 'ready' });
    expect(chain.eq).toHaveBeenCalledWith('status', 'accepted');
  });

  it('주문이 없으면 ORDER_NOT_FOUND를 던진다', async () => {
    const updateChain = buildChain({ data: [], error: null });
    const selectChain = buildChain({ data: null, error: null });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(selectChain),
    };
    mockServiceClient(client);

    await expect(
      markSellerOrderReady(STORE_ID, ORDER_ID)
    ).rejects.toMatchObject({
      code: ERROR_CODE.ORDER_NOT_FOUND,
    });
  });

  it('상태가 맞지 않으면 INVALID_ORDER_STATUS를 던진다', async () => {
    const updateChain = buildChain({ data: [], error: null });
    const selectChain = buildChain({ data: { id: ORDER_ID }, error: null });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(selectChain),
    };
    mockServiceClient(client);

    await expect(
      markSellerOrderReady(STORE_ID, ORDER_ID)
    ).rejects.toMatchObject({
      code: ERROR_CODE.INVALID_ORDER_STATUS,
    });
  });
});

describe('completeSellerOrder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ready → completed 전이 시 picked_up_at도 함께 갱신한다', async () => {
    const chain = buildChain({ data: [{ id: ORDER_ID }], error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    await expect(
      completeSellerOrder(STORE_ID, ORDER_ID)
    ).resolves.toBeUndefined();
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completed',
        picked_up_at: expect.any(String),
      })
    );
    expect(chain.eq).toHaveBeenCalledWith('status', 'ready');
  });

  it('주문이 없으면 ORDER_NOT_FOUND를 던진다', async () => {
    const updateChain = buildChain({ data: [], error: null });
    const selectChain = buildChain({ data: null, error: null });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(selectChain),
    };
    mockServiceClient(client);

    await expect(completeSellerOrder(STORE_ID, ORDER_ID)).rejects.toMatchObject(
      {
        code: ERROR_CODE.ORDER_NOT_FOUND,
      }
    );
  });

  it('상태가 맞지 않으면 INVALID_ORDER_STATUS를 던진다', async () => {
    const updateChain = buildChain({ data: [], error: null });
    const selectChain = buildChain({ data: { id: ORDER_ID }, error: null });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(updateChain)
        .mockReturnValueOnce(selectChain),
    };
    mockServiceClient(client);

    await expect(completeSellerOrder(STORE_ID, ORDER_ID)).rejects.toMatchObject(
      {
        code: ERROR_CODE.INVALID_ORDER_STATUS,
      }
    );
  });
});
