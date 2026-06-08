import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_CODE } from '@/lib/errors/errorCodes';

import { callTossCancel } from './toss-cancel';

const TOSS_CANCEL_URL =
  'https://api.tosspayments.com/v1/payments/toss_ppk_test/cancel';

describe('callTossCancel', () => {
  beforeEach(() => {
    vi.stubEnv('TOSS_SECRET_KEY', 'test_secret_key');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('Basic auth 헤더와 Idempotency-Key를 포함해 Toss cancel API 호출', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    await callTossCancel({
      orderNumber: 'PM2026TEST',
      paymentKey: 'toss_ppk_test',
      cancelReason: 'PickMa order cancel',
      cancelAmount: 5000,
    });

    expect(fetch).toHaveBeenCalledWith(
      TOSS_CANCEL_URL,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic '),
          'Idempotency-Key': 'cancel:PM2026TEST:toss_ppk_test',
        }),
      })
    );
  });

  it('cancelReason과 cancelAmount를 body에 포함', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    await callTossCancel({
      orderNumber: 'PM2026TEST',
      paymentKey: 'toss_ppk_test',
      cancelReason: 'PickMa order cancel',
      cancelAmount: 5000,
    });

    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse((callArgs[1] as RequestInit).body as string);
    expect(body).toEqual({
      cancelReason: 'PickMa order cancel',
      cancelAmount: 5000,
    });
  });

  it('200 응답 → resolve void', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    await expect(
      callTossCancel({
        orderNumber: 'PM2026TEST',
        paymentKey: 'toss_ppk_test',
        cancelReason: 'PickMa order cancel',
        cancelAmount: 5000,
      })
    ).resolves.toBeUndefined();
  });

  it('4xx 응답 → PAYMENT_CANCEL_FAILED 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 400 }));

    await expect(
      callTossCancel({
        orderNumber: 'PM2026TEST',
        paymentKey: 'toss_ppk_test',
        cancelReason: 'PickMa order cancel',
        cancelAmount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.PAYMENT_CANCEL_FAILED,
      statusCode: 500,
    });
  });

  it('5xx 응답 → PAYMENT_CANCEL_FAILED 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(
      callTossCancel({
        orderNumber: 'PM2026TEST',
        paymentKey: 'toss_ppk_test',
        cancelReason: 'PickMa order cancel',
        cancelAmount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.PAYMENT_CANCEL_FAILED,
      statusCode: 500,
    });
  });

  it('timeout → PAYMENT_CANCEL_FAILED 500', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(
      Object.assign(new DOMException('timeout', 'TimeoutError'))
    );

    await expect(
      callTossCancel({
        orderNumber: 'PM2026TEST',
        paymentKey: 'toss_ppk_test',
        cancelReason: 'PickMa order cancel',
        cancelAmount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.PAYMENT_CANCEL_FAILED,
      statusCode: 500,
    });
  });

  it('TOSS_SECRET_KEY 없으면 → INTERNAL_SERVER_ERROR', async () => {
    vi.stubEnv('TOSS_SECRET_KEY', '');
    await expect(
      callTossCancel({
        orderNumber: 'PM2026TEST',
        paymentKey: 'toss_ppk_test',
        cancelReason: 'PickMa order cancel',
        cancelAmount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.INTERNAL_SERVER_ERROR });
  });
});
