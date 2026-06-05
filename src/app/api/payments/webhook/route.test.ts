import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';

import { processWebhook } from './_lib/service';
import { POST } from './route';

vi.mock('./_lib/service', () => ({
  processWebhook: vi.fn(),
}));

const TRANSMISSION_ID = 'toss-transmission-1';

const validStatusChangedBody = {
  eventType: 'PAYMENT_STATUS_CHANGED',
  createdAt: '2026-01-01T00:00:00Z',
  data: {
    paymentKey: 'toss_ppk_PM2026TEST',
    orderId: 'PM2026TEST',
    totalAmount: 5000,
    status: 'DONE',
  },
};

const validDepositBody = {
  createdAt: '2026-01-01T00:00:00Z',
  secret: 'webhook-secret-123',
  status: 'DONE',
  orderId: 'PM2026TEST',
  transactionKey: 'toss-tx-1',
};

function makeRequest(body: unknown, transmissionId?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (transmissionId !== undefined && transmissionId !== null) {
    headers['tosspayments-webhook-transmission-id'] = transmissionId;
  }
  return new Request('http://localhost/api/payments/webhook', {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : 'not-json{',
  }) as unknown as NextRequest;
}

describe('POST /api/payments/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(processWebhook).mockResolvedValue(undefined);
  });

  it('PAYMENT_STATUS_CHANGED 정상 body + 헤더 → processWebhook 호출 후 200', async () => {
    const res = await POST(
      makeRequest(validStatusChangedBody, TRANSMISSION_ID)
    );
    expect(res.status).toBe(200);
    expect(processWebhook).toHaveBeenCalledWith(
      TRANSMISSION_ID,
      expect.objectContaining({ eventType: 'PAYMENT_STATUS_CHANGED' })
    );
  });

  it('DEPOSIT_CALLBACK 정상 body + 헤더 → processWebhook 호출 후 200', async () => {
    const res = await POST(makeRequest(validDepositBody, TRANSMISSION_ID));
    expect(res.status).toBe(200);
    expect(processWebhook).toHaveBeenCalledWith(
      TRANSMISSION_ID,
      expect.objectContaining({ orderId: 'PM2026TEST' })
    );
  });

  it('헤더 없음 → processWebhook(null, body) 호출 후 200', async () => {
    const res = await POST(makeRequest(validStatusChangedBody));
    expect(res.status).toBe(200);
    expect(processWebhook).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ eventType: 'PAYMENT_STATUS_CHANGED' })
    );
  });

  it('invalid JSON body → VALIDATION_ERROR 400', async () => {
    const req = new Request('http://localhost/api/payments/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    }) as unknown as NextRequest;
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('허용되지 않은 body (unknown eventType) → VALIDATION_ERROR 400', async () => {
    const res = await POST(
      makeRequest({ eventType: 'UNKNOWN_EVENT', data: {} }, TRANSMISSION_ID)
    );
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('service AppError → routeError envelope 변환', async () => {
    vi.mocked(processWebhook).mockRejectedValue(
      new AppError(ERROR_CODE.ORDER_NOT_FOUND, 404)
    );
    const res = await POST(
      makeRequest(validStatusChangedBody, TRANSMISSION_ID)
    );
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.error.code).toBe(ERROR_CODE.ORDER_NOT_FOUND);
  });

  it('service INVALID_WEBHOOK_PAYLOAD → 400', async () => {
    vi.mocked(processWebhook).mockRejectedValue(
      new AppError(ERROR_CODE.INVALID_WEBHOOK_PAYLOAD, 400)
    );
    const res = await POST(
      makeRequest(validStatusChangedBody, TRANSMISSION_ID)
    );
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error.code).toBe(ERROR_CODE.INVALID_WEBHOOK_PAYLOAD);
  });
});
