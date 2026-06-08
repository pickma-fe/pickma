import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { cancelPaymentById, confirmPayment, preparePayment } from './service';
import type { TossConfirmResult } from './toss';

vi.mock('@/lib/supabase/service');
vi.mock('./toss');
vi.mock('@/app/api/_lib/toss-cancel');

const mockUserId = 'user-1';

const mockOrderRow = {
  id: 'order-uuid-1',
  order_number: 'PM2026TEST',
  payment_amount: 5000,
  status: 'payment_pending',
  expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  store_id: 'store-uuid-1',
  pickup_service_date: '2026-05-15',
};

type MockOrderRow = typeof mockOrderRow;

const mockTossResult: TossConfirmResult = {
  paymentKey: 'toss_ppk_PM2026TEST',
  providerOrderId: 'PM2026TEST',
  method: 'card',
  methodDetail: null,
  pgResponse: {
    paymentKey: 'toss_ppk_PM2026TEST',
    orderId: 'PM2026TEST',
    method: 'card',
    status: 'DONE',
    secret: null,
  },
};

function makeClient({
  orderData = mockOrderRow,
  orderError = null as { message: string } | null,
  rpcErrors = {},
  seqLastSequence = 0,
  seqError = null as { message: string } | null,
}: {
  orderData?: MockOrderRow | null;
  orderError?: { message: string } | null;
  rpcErrors?: Record<string, { message: string } | null>;
  seqLastSequence?: number;
  seqError?: { message: string } | null;
} = {}) {
  const orderQueryMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi
      .fn()
      .mockResolvedValue({ data: orderData, error: orderError }),
  };
  const seqQueryMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: seqLastSequence > 0 ? { last_sequence: seqLastSequence } : null,
      error: seqError,
    }),
  };
  const paymentEventsInsertMock = {
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'store_order_sequences') return seqQueryMock;
      if (table === 'payment_events') return paymentEventsInsertMock;
      return orderQueryMock;
    }),
    rpc: vi
      .fn()
      .mockImplementation((fnName: string) =>
        Promise.resolve({ data: null, error: rpcErrors[fnName] ?? null })
      ),
    paymentEventsInsertMock,
  };
}

describe('preparePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PAYMENT_MOCK', 'true');
  });

  it('PAYMENT_MOCK=true → mock redirectUrl 반환', async () => {
    const client = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    const result = await preparePayment(
      mockUserId,
      { orderNumber: 'PM2026TEST', orderName: '크루아상 2개' },
      'http://localhost/payment/success'
    );
    expect(result.redirectUrl).toContain('paymentKey=mock_pk_');
    expect(result.redirectUrl).toContain('orderId=PM2026TEST');
    expect(result.amount).toBe(5000);
  });

  it('PAYMENT_MOCK=false → buildTossCheckoutUrl 호출', async () => {
    vi.stubEnv('PAYMENT_MOCK', 'false');
    const { buildTossCheckoutUrl } = await import('./toss');
    vi.mocked(buildTossCheckoutUrl).mockReturnValue(
      '/payment/toss-checkout?orderNumber=PM2026TEST&amount=5000&orderName=%ED%81%AC%EB%A3%A8%EC%95%84%EC%83%812%EA%B0%9C'
    );
    const client = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await preparePayment(
      mockUserId,
      { orderNumber: 'PM2026TEST', orderName: '크루아상 2개' },
      'http://localhost/payment/success'
    );
    expect(buildTossCheckoutUrl).toHaveBeenCalledWith({
      orderNumber: 'PM2026TEST',
      amount: 5000,
      orderName: '크루아상 2개',
    });
  });

  it('주문 없음 → ORDER_NOT_FOUND', async () => {
    const client = makeClient({ orderData: null });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      preparePayment(
        mockUserId,
        { orderNumber: 'NOTFOUND', orderName: '크루아상 2개' },
        'http://localhost/payment/success'
      )
    ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_NOT_FOUND });
  });

  it('만료된 주문 → expire_order RPC 호출 후 ORDER_EXPIRED', async () => {
    const client = makeClient({
      orderData: { ...mockOrderRow, expires_at: '2020-01-01T00:00:00.000Z' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      preparePayment(
        mockUserId,
        { orderNumber: 'PM2026TEST', orderName: '크루아상 2개' },
        'http://localhost/payment/success'
      )
    ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_EXPIRED });
    expect(client.rpc).toHaveBeenCalledWith('expire_order', {
      p_order_id: 'order-uuid-1',
    });
  });

  it('만료된 주문, expire_order RPC 실패 → INTERNAL_SERVER_ERROR', async () => {
    const client = makeClient({
      orderData: { ...mockOrderRow, expires_at: '2020-01-01T00:00:00.000Z' },
      rpcErrors: { expire_order: { message: 'db error' } },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      preparePayment(
        mockUserId,
        { orderNumber: 'PM2026TEST', orderName: '크루아상 2개' },
        'http://localhost/payment/success'
      )
    ).rejects.toMatchObject({ code: ERROR_CODE.INTERNAL_SERVER_ERROR });
  });

  it('DB 오류 → INTERNAL_SERVER_ERROR', async () => {
    const client = makeClient({ orderError: { message: 'db error' } });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      preparePayment(
        mockUserId,
        { orderNumber: 'PM2026TEST', orderName: '크루아상 2개' },
        'http://localhost/payment/success'
      )
    ).rejects.toMatchObject({ code: ERROR_CODE.INTERNAL_SERVER_ERROR });
  });
});

describe('confirmPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PAYMENT_MOCK', 'true');
  });

  it('PAYMENT_MOCK=true → callTossConfirm 미호출, confirm_payment RPC 정상', async () => {
    const client = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    const { callTossConfirm } = await import('./toss');
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'mock_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).resolves.toBeUndefined();
    expect(callTossConfirm).not.toHaveBeenCalled();
    expect(client.rpc).toHaveBeenCalledWith('begin_payment_processing', {
      p_order_id: 'order-uuid-1',
    });
    expect(client.rpc).toHaveBeenCalledWith(
      'confirm_payment',
      expect.objectContaining({
        p_order_number: 'PM2026TEST',
        p_payment_key: 'mock_pk_test',
        p_amount: 5000,
        p_pg_response: {
          paymentKey: 'mock_pk_test',
          orderId: 'PM2026TEST',
          method: 'card',
          status: 'DONE',
          secret: null,
        },
      })
    );
  });

  it('PAYMENT_MOCK=false → callTossConfirm 호출', async () => {
    vi.stubEnv('PAYMENT_MOCK', 'false');
    const { callTossConfirm } = await import('./toss');
    vi.mocked(callTossConfirm).mockResolvedValue(mockTossResult);
    const client = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await confirmPayment(mockUserId, {
      paymentKey: 'toss_pk_test',
      orderNumber: 'PM2026TEST',
      amount: 5000,
    });
    expect(callTossConfirm).toHaveBeenCalledWith({
      paymentKey: 'toss_pk_test',
      orderNumber: 'PM2026TEST',
      amount: 5000,
    });
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
        paymentKey: 'mock_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_EXPIRED });
  });

  it('status가 reserved → PAYMENT_ALREADY_CONFIRMED 409', async () => {
    const client = makeClient({
      orderData: { ...mockOrderRow, status: 'reserved' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'mock_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.PAYMENT_ALREADY_CONFIRMED,
      statusCode: 409,
    });
  });

  it('status가 payment_pending 아닌 비정상 상태 → INVALID_ORDER_STATUS', async () => {
    const client = makeClient({
      orderData: { ...mockOrderRow, status: 'cancelled' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'mock_pk_test',
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
        paymentKey: 'mock_pk_test',
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
      rpcErrors: { expire_order: { message: 'db error' } },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'mock_pk_test',
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
        paymentKey: 'mock_pk_test',
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
        paymentKey: 'mock_pk_test',
        orderNumber: 'NOTFOUND',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_NOT_FOUND });
  });

  it('픽업번호 capacity 소진(last_sequence >= 2574) → PICKUP_NUMBER_EXHAUSTED 409, begin 미호출', async () => {
    const client = makeClient({ seqLastSequence: 2574 });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'mock_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.PICKUP_NUMBER_EXHAUSTED,
      statusCode: 409,
    });
    expect(client.rpc).not.toHaveBeenCalledWith(
      'begin_payment_processing',
      expect.anything()
    );
  });

  it('begin_payment_processing 실패(경쟁 요청) → INVALID_ORDER_STATUS 409', async () => {
    const client = makeClient({
      rpcErrors: {
        begin_payment_processing: { message: 'INVALID_ORDER_STATUS' },
      },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'mock_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.INVALID_ORDER_STATUS,
      statusCode: 409,
    });
  });

  it('callTossConfirm 네트워크 실패 → revert 후 PAYMENT_CONFIRM_FAILED 500', async () => {
    vi.stubEnv('PAYMENT_MOCK', 'false');
    const { callTossConfirm } = await import('./toss');
    vi.mocked(callTossConfirm).mockRejectedValueOnce(
      new Error('network error')
    );
    const client = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'toss_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.PAYMENT_CONFIRM_FAILED,
      statusCode: 500,
    });
    expect(client.rpc).toHaveBeenCalledWith('revert_payment_processing', {
      p_order_id: 'order-uuid-1',
    });
  });

  it('callTossConfirm AppError(INVALID_ORDER_STATUS 409) → revert 후 그대로 409 보존', async () => {
    vi.stubEnv('PAYMENT_MOCK', 'false');
    const { callTossConfirm } = await import('./toss');
    const { AppError } = await import('@/lib/errors/appError');
    vi.mocked(callTossConfirm).mockRejectedValueOnce(
      new AppError(ERROR_CODE.INVALID_ORDER_STATUS, 409)
    );
    const client = makeClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'toss_pk_dup',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.INVALID_ORDER_STATUS,
      statusCode: 409,
    });
    expect(client.rpc).toHaveBeenCalledWith('revert_payment_processing', {
      p_order_id: 'order-uuid-1',
    });
  });

  it('confirm_payment RPC INVALID_ORDER_STATUS → 409', async () => {
    const client = makeClient({
      rpcErrors: { confirm_payment: { message: 'INVALID_ORDER_STATUS' } },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'mock_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.INVALID_ORDER_STATUS,
      statusCode: 409,
    });
  });

  it('confirm_payment RPC ORDER_EXPIRED → 409', async () => {
    const client = makeClient({
      rpcErrors: { confirm_payment: { message: 'ORDER_EXPIRED' } },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'mock_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.ORDER_EXPIRED,
      statusCode: 409,
    });
  });

  it('confirm_payment RPC PICKUP_NUMBER_EXHAUSTED → 409', async () => {
    const client = makeClient({
      rpcErrors: { confirm_payment: { message: 'PICKUP_NUMBER_EXHAUSTED' } },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'mock_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.PICKUP_NUMBER_EXHAUSTED,
      statusCode: 409,
    });
  });

  it('confirm_payment RPC 알 수 없는 오류 → PAYMENT_CONFIRM_FAILED 500', async () => {
    const client = makeClient({
      rpcErrors: { confirm_payment: { message: 'unknown error' } },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      confirmPayment(mockUserId, {
        paymentKey: 'mock_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.PAYMENT_CONFIRM_FAILED });
  });

  describe('confirm_payment RPC 실패 시 Option B 보상', () => {
    it('PAYMENT_MOCK=false + cancel 성공 → revert_payment_processing 호출 후 PAYMENT_CONFIRM_FAILED', async () => {
      vi.stubEnv('PAYMENT_MOCK', 'false');
      const { callTossConfirm } = await import('./toss');
      const { callTossCancel } = await import('@/app/api/_lib/toss-cancel');
      vi.mocked(callTossConfirm).mockResolvedValue(mockTossResult);
      vi.mocked(callTossCancel).mockResolvedValue(undefined);
      const client = makeClient({
        rpcErrors: { confirm_payment: { message: 'unknown error' } },
      });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );

      await expect(
        confirmPayment(mockUserId, {
          paymentKey: 'toss_pk_test',
          orderNumber: 'PM2026TEST',
          amount: 5000,
        })
      ).rejects.toMatchObject({ code: ERROR_CODE.PAYMENT_CONFIRM_FAILED });

      expect(callTossCancel).toHaveBeenCalledWith(
        expect.objectContaining({
          orderNumber: 'PM2026TEST',
          paymentKey: mockTossResult.paymentKey,
          cancelAmount: 5000,
        })
      );
      expect(client.rpc).toHaveBeenCalledWith('revert_payment_processing', {
        p_order_id: 'order-uuid-1',
      });
    });

    it('PAYMENT_MOCK=false + cancel 실패 → revert_payment_processing 미호출 후 PAYMENT_CONFIRM_FAILED', async () => {
      vi.stubEnv('PAYMENT_MOCK', 'false');
      const { callTossConfirm } = await import('./toss');
      const { callTossCancel } = await import('@/app/api/_lib/toss-cancel');
      vi.mocked(callTossConfirm).mockResolvedValue(mockTossResult);
      const { AppError } = await import('@/lib/errors/appError');
      vi.mocked(callTossCancel).mockRejectedValueOnce(
        new AppError(ERROR_CODE.PAYMENT_CONFIRM_FAILED, 500)
      );
      const client = makeClient({
        rpcErrors: { confirm_payment: { message: 'unknown error' } },
      });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );

      await expect(
        confirmPayment(mockUserId, {
          paymentKey: 'toss_pk_test',
          orderNumber: 'PM2026TEST',
          amount: 5000,
        })
      ).rejects.toMatchObject({ code: ERROR_CODE.PAYMENT_CONFIRM_FAILED });

      expect(client.rpc).not.toHaveBeenCalledWith(
        'revert_payment_processing',
        expect.anything()
      );
      expect(client.paymentEventsInsertMock.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'payment_compensation_failed',
          payload: expect.objectContaining({ failureStage: 'toss_cancel' }),
        })
      );
    });

    it('PAYMENT_MOCK=false + cancel 성공 + revert 실패 → PAYMENT_CONFIRM_FAILED', async () => {
      vi.stubEnv('PAYMENT_MOCK', 'false');
      const { callTossConfirm } = await import('./toss');
      const { callTossCancel } = await import('@/app/api/_lib/toss-cancel');
      vi.mocked(callTossConfirm).mockResolvedValue(mockTossResult);
      vi.mocked(callTossCancel).mockResolvedValue(undefined);
      const client = makeClient({
        rpcErrors: {
          confirm_payment: { message: 'unknown error' },
          revert_payment_processing: { message: 'db error' },
        },
      });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );

      await expect(
        confirmPayment(mockUserId, {
          paymentKey: 'toss_pk_test',
          orderNumber: 'PM2026TEST',
          amount: 5000,
        })
      ).rejects.toMatchObject({ code: ERROR_CODE.PAYMENT_CONFIRM_FAILED });

      expect(client.rpc).toHaveBeenCalledWith('revert_payment_processing', {
        p_order_id: 'order-uuid-1',
      });
      expect(client.paymentEventsInsertMock.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'payment_compensation_failed',
          payload: expect.objectContaining({
            failureStage: 'revert_processing',
          }),
        })
      );
    });

    it('PAYMENT_MOCK=true + confirm_payment 실패 → cancel 미호출, revert_payment_processing 호출', async () => {
      const { callTossCancel } = await import('@/app/api/_lib/toss-cancel');
      const client = makeClient({
        rpcErrors: { confirm_payment: { message: 'unknown error' } },
      });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );

      await expect(
        confirmPayment(mockUserId, {
          paymentKey: 'mock_pk_test',
          orderNumber: 'PM2026TEST',
          amount: 5000,
        })
      ).rejects.toMatchObject({ code: ERROR_CODE.PAYMENT_CONFIRM_FAILED });

      expect(callTossCancel).not.toHaveBeenCalled();
      expect(client.rpc).toHaveBeenCalledWith('revert_payment_processing', {
        p_order_id: 'order-uuid-1',
      });
    });
  });
});

const mockPaymentRow = {
  id: 'payment-uuid-1',
  payment_key: 'toss_ppk_test',
  status: 'paid',
  order_id: 'order-uuid-1',
};

const mockOrderRowForCancel = {
  id: 'order-uuid-1',
  order_number: 'PM2026TEST',
  store_id: 'store-uuid-1',
  status: 'reserved',
  payment_amount: 5000,
  cancel_claimed_status: null as string | null,
};

type MockPaymentRow = typeof mockPaymentRow;
type MockOrderRowForCancel = typeof mockOrderRowForCancel;

function makeAdminClient(
  overrides: {
    paymentData?: MockPaymentRow | null;
    paymentError?: { message: string } | null;
    orderData?: MockOrderRowForCancel | null;
    orderError?: { message: string } | null;
    updateError?: { message: string } | null;
    rpcError?: { message: string } | null;
    insertError?: { message: string } | null;
  } = {}
) {
  const {
    paymentData = mockPaymentRow,
    paymentError = null,
    orderData = mockOrderRowForCancel,
    orderError = null,
    updateError = null,
    rpcError = null,
    insertError = null,
  } = overrides;

  const selectAfterEqFn = vi.fn().mockResolvedValue({
    data: updateError ? null : [{ id: 'order-uuid-1' }],
    error: updateError,
  });
  const innerEqFn = vi.fn().mockReturnValue({ select: selectAfterEqFn });
  const outerEqFn = vi.fn().mockReturnValue({ eq: innerEqFn });
  const ordersUpdateChain = {
    update: vi.fn().mockReturnValue({ eq: outerEqFn }),
    eq: outerEqFn,
  };

  const insertMock = {
    insert: vi.fn().mockResolvedValue({ error: insertError }),
  };

  const paymentsFrom = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi
      .fn()
      .mockResolvedValue({ data: paymentData, error: paymentError }),
  };

  const ordersFrom = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: orderData, error: orderError }),
    update: vi.fn().mockImplementation(() => ordersUpdateChain),
  };

  const client = {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'payments') return paymentsFrom;
      if (table === 'orders') return ordersFrom;
      if (table === 'payment_events') return insertMock;
      return {};
    }),
    rpc: vi.fn().mockResolvedValue({ error: rpcError }),
    insertMock,
    ordersFrom,
  };
  return client;
}

describe('cancelPaymentById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PAYMENT_MOCK', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('payment 없음 → NOT_FOUND 404', async () => {
    const client = makeAdminClient({ paymentData: null });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(
      cancelPaymentById('payment-uuid-1', '관리자 취소')
    ).rejects.toMatchObject({ code: ERROR_CODE.NOT_FOUND, statusCode: 404 });
  });

  it('payment.status !== paid → INVALID_ORDER_STATUS 409', async () => {
    const client = makeAdminClient({
      paymentData: { ...mockPaymentRow, status: 'pending' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(
      cancelPaymentById('payment-uuid-1', '관리자 취소')
    ).rejects.toMatchObject({
      code: ERROR_CODE.INVALID_ORDER_STATUS,
      statusCode: 409,
    });
  });

  it('order.status가 허용 목록 외 → INVALID_ORDER_STATUS 409', async () => {
    const client = makeAdminClient({
      orderData: { ...mockOrderRowForCancel, status: 'completed' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(
      cancelPaymentById('payment-uuid-1', '관리자 취소')
    ).rejects.toMatchObject({
      code: ERROR_CODE.INVALID_ORDER_STATUS,
      statusCode: 409,
    });
  });

  it('클레임 업데이트 0 rows(동시 요청) → INVALID_ORDER_STATUS 409', async () => {
    const client = makeAdminClient({ updateError: null });
    // select 결과가 빈 배열 → 다른 요청이 이미 상태 변경
    const selectAfterEqFn = vi
      .fn()
      .mockResolvedValue({ data: [], error: null });
    (client.from('orders').update as ReturnType<typeof vi.fn>).mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ select: selectAfterEqFn }),
      }),
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(
      cancelPaymentById('payment-uuid-1', '관리자 취소')
    ).rejects.toMatchObject({
      code: ERROR_CODE.INVALID_ORDER_STATUS,
      statusCode: 409,
    });
  });

  it('PAYMENT_MOCK=true → cancel_order RPC 호출', async () => {
    const client = makeAdminClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await cancelPaymentById('payment-uuid-1', '관리자 취소');

    expect(client.rpc).toHaveBeenCalledWith('cancel_order', {
      p_order_id: 'order-uuid-1',
      p_reason: '관리자 취소',
    });
  });

  it('PAYMENT_MOCK=false + Toss 성공 → cancel_order RPC 호출', async () => {
    vi.stubEnv('PAYMENT_MOCK', 'false');
    const { callTossCancel } = await import('@/app/api/_lib/toss-cancel');
    vi.mocked(callTossCancel).mockResolvedValue(undefined);
    const client = makeAdminClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await cancelPaymentById('payment-uuid-1', '관리자 취소');

    expect(callTossCancel).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentKey: 'toss_ppk_test',
        cancelAmount: 5000,
      })
    );
    expect(client.rpc).toHaveBeenCalledWith('cancel_order', expect.anything());
  });

  it('PAYMENT_MOCK=false + Toss 실패 → 주문 상태 복원 후 PAYMENT_CANCEL_FAILED 502', async () => {
    vi.stubEnv('PAYMENT_MOCK', 'false');
    const { callTossCancel } = await import('@/app/api/_lib/toss-cancel');
    vi.mocked(callTossCancel).mockRejectedValueOnce(new Error('Toss fail'));
    const client = makeAdminClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(
      cancelPaymentById('payment-uuid-1', '관리자 취소')
    ).rejects.toMatchObject({
      code: ERROR_CODE.PAYMENT_CANCEL_FAILED,
      statusCode: 502,
    });
    expect(client.ordersFrom.update).toHaveBeenCalledTimes(2); // claim + revert
  });

  it('cancel_order RPC 실패 → compensation 이벤트 insert + PAYMENT_CANCEL_FAILED 502', async () => {
    const client = makeAdminClient({ rpcError: { message: 'db error' } });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );

    await expect(
      cancelPaymentById('payment-uuid-1', '관리자 취소')
    ).rejects.toMatchObject({
      code: ERROR_CODE.PAYMENT_CANCEL_FAILED,
      statusCode: 502,
    });

    await new Promise((r) => setTimeout(r, 10)); // fire-and-forget flush
    expect(client.insertMock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: 'payment_compensation_failed',
        payload: expect.objectContaining({ failureStage: 'cancel_finalize' }),
      })
    );
  });
});
