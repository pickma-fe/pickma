import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { processWebhook } from './service';

vi.mock('@/lib/supabase/service');

const ORDER_ID = 'order-uuid-1';
const ORDER_NUMBER = 'PM2026TEST';
const STORE_ID = 'store-uuid-1';
const PAYMENT_ID = 'payment-uuid-1';
const PAYMENT_KEY = 'toss_ppk_PM2026TEST';
const TRANSMISSION_ID = 'toss-transmission-1';

const mockOrder = {
  id: ORDER_ID,
  order_number: ORDER_NUMBER,
  store_id: STORE_ID,
  payment_amount: 5000,
};

const mockPayment = {
  id: PAYMENT_ID,
  provider_payment_key: PAYMENT_KEY,
  method: 'card',
  pg_response: {
    paymentKey: PAYMENT_KEY,
    orderId: ORDER_NUMBER,
    method: 'card',
    status: 'DONE',
    secret: null,
  },
};

const mockPaymentVirtualAccount = {
  id: PAYMENT_ID,
  provider_payment_key: PAYMENT_KEY,
  method: 'virtual_account',
  pg_response: {
    paymentKey: PAYMENT_KEY,
    orderId: ORDER_NUMBER,
    method: 'virtual_account',
    status: 'WAITING_FOR_DEPOSIT',
    secret: 'webhook-secret-123',
  },
};

const validStatusChangedBody = {
  eventType: 'PAYMENT_STATUS_CHANGED' as const,
  createdAt: '2026-01-01T00:00:00Z',
  data: {
    paymentKey: PAYMENT_KEY,
    orderId: ORDER_NUMBER,
    totalAmount: 5000,
    status: 'DONE',
    method: 'card',
  },
};

const validDepositBody = {
  createdAt: '2026-01-01T00:00:00Z',
  secret: 'webhook-secret-123',
  status: 'DONE',
  orderId: ORDER_NUMBER,
  transactionKey: 'toss-tx-1',
};

function makeInsertChain(
  returnId: string | null = 'event-uuid-1',
  error: { code?: string; message: string } | null = null
) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: returnId ? { id: returnId } : null,
      error,
    }),
  };
}

function makeUpdateChain() {
  return {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
}

function makeSelectChain(
  data: unknown,
  error: { message: string } | null = null
) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  };
}

interface MakeClientOptions {
  existingEvent?: { id: string } | null;
  order?: typeof mockOrder | null;
  orderError?: { message: string } | null;
  payment?: typeof mockPayment | typeof mockPaymentVirtualAccount | null;
  insertEventId?: string | null;
  insertError?: { code?: string; message: string } | null;
}

function makeClient({
  existingEvent = null,
  order = mockOrder,
  orderError = null,
  payment = mockPayment,
  insertEventId = 'event-uuid-1',
  insertError = null,
}: MakeClientOptions = {}) {
  const eventSelectChain = makeSelectChain(existingEvent);
  const orderSelectChain = makeSelectChain(order, orderError);
  const paymentSelectChain = makeSelectChain(payment);
  const insertChain = makeInsertChain(insertEventId, insertError);
  const updateChain = makeUpdateChain();

  let eventSelectCalled = false;

  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'payment_events') {
        if (!eventSelectCalled) {
          eventSelectCalled = true;
          return {
            ...eventSelectChain,
            insert: insertChain.insert.bind(insertChain),
            update: updateChain.update.bind(updateChain),
          };
        }
        return {
          insert: insertChain.insert.bind(insertChain),
          update: updateChain.update.bind(updateChain),
        };
      }
      if (table === 'orders') return orderSelectChain;
      if (table === 'payments') return paymentSelectChain;
      return makeSelectChain(null);
    }),
    insertChain,
    updateChain,
  };
}

describe('processWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('멱등 처리', () => {
    it('동일 transmissionId가 이미 기록된 경우 early return', async () => {
      const client = makeClient({
        existingEvent: { id: 'event-uuid-existing' },
      });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      await processWebhook(TRANSMISSION_ID, validStatusChangedBody);
      expect(client.insertChain.insert).not.toHaveBeenCalled();
    });

    it('transmissionId=null이면 멱등 확인 건너뜀', async () => {
      const client = makeClient();
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      await processWebhook(null, validStatusChangedBody);
      expect(client.insertChain.insert).toHaveBeenCalled();
    });
  });

  describe('PAYMENT_STATUS_CHANGED 정상 처리', () => {
    it('검증 통과 시 pending INSERT 후 processed UPDATE', async () => {
      const client = makeClient();
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      await processWebhook(TRANSMISSION_ID, validStatusChangedBody);
      expect(client.insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'payment_webhook_received',
          status: 'pending',
          order_id: ORDER_ID,
          order_number: ORDER_NUMBER,
          provider: 'toss',
          provider_event_id: TRANSMISSION_ID,
          provider_event_type: 'PAYMENT_STATUS_CHANGED',
          provider_key: PAYMENT_KEY,
        })
      );
      expect(client.updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'processed',
          processed_at: expect.any(String),
        })
      );
    });
  });

  describe('PAYMENT_STATUS_CHANGED 검증 실패', () => {
    it('order 없음 → ORDER_NOT_FOUND 404', async () => {
      const client = makeClient({ order: null });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      await expect(
        processWebhook(TRANSMISSION_ID, validStatusChangedBody)
      ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_NOT_FOUND });
      expect(client.insertChain.insert).not.toHaveBeenCalled();
    });

    it('금액 불일치 → INVALID_WEBHOOK_PAYLOAD 400 + failed INSERT', async () => {
      const client = makeClient();
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      const body = {
        ...validStatusChangedBody,
        data: { ...validStatusChangedBody.data, totalAmount: 9999 },
      };
      await expect(processWebhook(TRANSMISSION_ID, body)).rejects.toMatchObject(
        { code: ERROR_CODE.INVALID_WEBHOOK_PAYLOAD }
      );
      expect(client.insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error_message: 'totalAmount mismatch',
        })
      );
    });

    it('payment 없음 → INVALID_WEBHOOK_PAYLOAD 400 + failed INSERT', async () => {
      const client = makeClient({ payment: null });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      await expect(
        processWebhook(TRANSMISSION_ID, validStatusChangedBody)
      ).rejects.toMatchObject({ code: ERROR_CODE.INVALID_WEBHOOK_PAYLOAD });
      expect(client.insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error_message: 'payment not found',
        })
      );
    });

    it('paymentKey 불일치 → INVALID_WEBHOOK_PAYLOAD 400', async () => {
      const client = makeClient();
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      const body = {
        ...validStatusChangedBody,
        data: { ...validStatusChangedBody.data, paymentKey: 'wrong-key' },
      };
      await expect(processWebhook(TRANSMISSION_ID, body)).rejects.toMatchObject(
        { code: ERROR_CODE.INVALID_WEBHOOK_PAYLOAD }
      );
      expect(client.insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error_message: 'paymentKey mismatch',
        })
      );
    });

    it('method 불일치 → INVALID_WEBHOOK_PAYLOAD 400', async () => {
      const client = makeClient();
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      const body = {
        ...validStatusChangedBody,
        data: { ...validStatusChangedBody.data, method: 'virtual_account' },
      };
      await expect(processWebhook(TRANSMISSION_ID, body)).rejects.toMatchObject(
        { code: ERROR_CODE.INVALID_WEBHOOK_PAYLOAD }
      );
      expect(client.insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error_message: 'method mismatch',
        })
      );
    });

    it('INSERT 중 23505 unique violation → early return (동시 중복)', async () => {
      const client = makeClient({
        insertError: { code: '23505', message: 'duplicate' },
      });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      await expect(
        processWebhook(TRANSMISSION_ID, validStatusChangedBody)
      ).resolves.toBeUndefined();
      expect(client.updateChain.update).not.toHaveBeenCalled();
    });
  });

  describe('DEPOSIT_CALLBACK 정상 처리', () => {
    it('secret 일치 시 pending INSERT 후 processed UPDATE', async () => {
      const client = makeClient({ payment: mockPaymentVirtualAccount });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      await processWebhook(TRANSMISSION_ID, validDepositBody);
      expect(client.insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'payment_webhook_received',
          status: 'pending',
          provider_event_type: 'DEPOSIT_CALLBACK',
          provider: 'toss',
        })
      );
      expect(client.updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'processed' })
      );
    });
  });

  describe('DEPOSIT_CALLBACK 검증 실패', () => {
    it('order 없음 → ORDER_NOT_FOUND 404', async () => {
      const client = makeClient({ order: null });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      await expect(
        processWebhook(TRANSMISSION_ID, validDepositBody)
      ).rejects.toMatchObject({ code: ERROR_CODE.ORDER_NOT_FOUND });
      expect(client.insertChain.insert).not.toHaveBeenCalled();
    });

    it('payment 없음 → INVALID_WEBHOOK_PAYLOAD 400 + failed INSERT', async () => {
      const client = makeClient({ payment: null });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      await expect(
        processWebhook(TRANSMISSION_ID, validDepositBody)
      ).rejects.toMatchObject({ code: ERROR_CODE.INVALID_WEBHOOK_PAYLOAD });
      expect(client.insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error_message: 'payment not found',
        })
      );
    });

    it('method !== virtual_account → INVALID_WEBHOOK_PAYLOAD 400', async () => {
      const client = makeClient({ payment: mockPayment });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      await expect(
        processWebhook(TRANSMISSION_ID, validDepositBody)
      ).rejects.toMatchObject({ code: ERROR_CODE.INVALID_WEBHOOK_PAYLOAD });
      expect(client.insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error_message: 'method is not virtual_account',
        })
      );
    });

    it('secret 불일치 → INVALID_WEBHOOK_PAYLOAD 400', async () => {
      const client = makeClient({ payment: mockPaymentVirtualAccount });
      vi.mocked(createServiceRoleClient).mockReturnValue(
        client as unknown as ReturnType<typeof createServiceRoleClient>
      );
      const body = { ...validDepositBody, secret: 'wrong-secret' };
      await expect(processWebhook(TRANSMISSION_ID, body)).rejects.toMatchObject(
        { code: ERROR_CODE.INVALID_WEBHOOK_PAYLOAD }
      );
      expect(client.insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error_message: 'secret mismatch',
        })
      );
    });
  });
});
