import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { getPaymentProviderAdapter } from './providers';
import { confirmPayment, preparePayment } from './service';

vi.mock('@/lib/supabase/service');
vi.mock('./providers');

const mockUserId = 'user-1';

const mockOrderRow = {
  id: 'order-uuid-1',
  order_number: 'PM2026TEST',
  payment_amount: 5000,
  status: 'payment_pending',
  expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
};

type MockOrderRow = typeof mockOrderRow;

const mockAdapter = {
  prepare: vi.fn().mockResolvedValue({
    redirectUrl:
      '/payment/success?orderNumber=PM2026TEST&provider=toss&amount=5000',
  }),
  confirm: vi.fn().mockResolvedValue({
    providerPaymentKey: 'mock_ppk_PM2026TEST',
    providerOrderId: 'mock_poi_PM2026TEST',
    method: 'card',
    methodDetail: null,
  }),
};

function makeClient({
  orderData = mockOrderRow,
  orderError = null as { message: string } | null,
  rpcError = null as { message: string } | null,
}: {
  orderData?: MockOrderRow | null;
  orderError?: { message: string } | null;
  rpcError?: { message: string } | null;
} = {}) {
  const queryMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi
      .fn()
      .mockResolvedValue({ data: orderData, error: orderError }),
  };
  return {
    from: vi.fn().mockReturnValue(queryMock),
    rpc: vi.fn().mockResolvedValue({ data: null, error: rpcError }),
  };
}

describe('preparePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPaymentProviderAdapter).mockReturnValue(mockAdapter);
  });

  it('정상 → PreparePaymentResponse 반환', async () => {
    const client = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    const result = await preparePayment(
      mockUserId,
      { provider: 'toss', orderNumber: 'PM2026TEST' },
      'http://localhost/payment/success'
    );
    expect(result.provider).toBe('toss');
    expect(result.flow).toBe('redirect');
    expect(result.redirectUrl).toContain('/payment/success');
    expect(result.amount).toBe(5000);
  });

  it('주문 없음 → ORDER_NOT_FOUND', async () => {
    const client = makeClient({ orderData: null });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      preparePayment(
        mockUserId,
        { provider: 'toss', orderNumber: 'NOTFOUND' },
        'http://localhost/payment/success'
      )
    ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_NOT_FOUND });
  });

  it('만료된 주문 → ORDER_NOT_FOUND', async () => {
    const client = makeClient({
      orderData: { ...mockOrderRow, expires_at: '2020-01-01T00:00:00.000Z' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      preparePayment(
        mockUserId,
        { provider: 'toss', orderNumber: 'PM2026TEST' },
        'http://localhost/payment/success'
      )
    ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_NOT_FOUND });
  });

  it('DB 오류 → INTERNAL_SERVER_ERROR', async () => {
    const client = makeClient({ orderError: { message: 'db error' } });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      preparePayment(
        mockUserId,
        { provider: 'toss', orderNumber: 'PM2026TEST' },
        'http://localhost/payment/success'
      )
    ).rejects.toMatchObject({ code: ERROR_CODE.INTERNAL_SERVER_ERROR });
  });
});

describe('confirmPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPaymentProviderAdapter).mockReturnValue(mockAdapter);
  });

  it('정상 → RPC 호출 후 void 반환', async () => {
    const client = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).resolves.toBeUndefined();
    expect(client.rpc).toHaveBeenCalledWith(
      'confirm_payment',
      expect.objectContaining({
        p_order_number: 'PM2026TEST',
        p_provider: 'toss',
        p_amount: 5000,
      })
    );
  });

  it('status가 expired → ORDER_EXPIRED', async () => {
    const client = makeClient({
      orderData: { ...mockOrderRow, status: 'expired' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_EXPIRED });
  });

  it('status가 payment_pending 아님 → INVALID_ORDER_STATUS', async () => {
    const client = makeClient({
      orderData: { ...mockOrderRow, status: 'reserved' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.INVALID_ORDER_STATUS });
  });

  it('만료된 주문 → expire_order RPC 호출 후 ORDER_EXPIRED', async () => {
    const client = makeClient({
      orderData: { ...mockOrderRow, expires_at: '2020-01-01T00:00:00.000Z' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_EXPIRED });
    expect(client.rpc).toHaveBeenCalledWith('expire_order', {
      p_order_id: 'order-uuid-1',
    });
  });

  it('만료된 주문, expire_order RPC 실패 → INTERNAL_SERVER_ERROR', async () => {
    const client = makeClient({
      orderData: { ...mockOrderRow, expires_at: '2020-01-01T00:00:00.000Z' },
      rpcError: { message: 'db error' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.INTERNAL_SERVER_ERROR });
  });

  it('amount 불일치 → PAYMENT_AMOUNT_MISMATCH', async () => {
    const client = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'PM2026TEST',
        amount: 9999,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.PAYMENT_AMOUNT_MISMATCH });
  });

  it('주문 없음 → ORDER_NOT_FOUND', async () => {
    const client = makeClient({ orderData: null });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'NOTFOUND',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_NOT_FOUND });
  });

  it('RPC INVALID_ORDER_STATUS → 409', async () => {
    const client = makeClient({
      rpcError: { message: 'INVALID_ORDER_STATUS' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.INVALID_ORDER_STATUS,
      statusCode: 409,
    });
  });

  it('RPC ORDER_EXPIRED → 409', async () => {
    const client = makeClient({ rpcError: { message: 'ORDER_EXPIRED' } });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.ORDER_EXPIRED,
      statusCode: 409,
    });
  });

  it('RPC PICKUP_NUMBER_EXHAUSTED → 409', async () => {
    const client = makeClient({
      rpcError: { message: 'PICKUP_NUMBER_EXHAUSTED' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.PICKUP_NUMBER_EXHAUSTED,
      statusCode: 409,
    });
  });

  it('RPC 알 수 없는 오류 → PAYMENT_CONFIRM_FAILED 500', async () => {
    const client = makeClient({ rpcError: { message: 'unknown error' } });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        provider: 'toss',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.PAYMENT_CONFIRM_FAILED });
  });
});
