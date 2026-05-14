import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_CODE } from '@/lib/errors/errorCodes';

import { buildTossCheckoutUrl, callTossConfirm } from './toss';

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';

describe('buildTossCheckoutUrl', () => {
  it('query string에 orderNumber, amount, orderName이 포함된다', () => {
    const url = buildTossCheckoutUrl({
      orderNumber: 'PM2026TEST',
      amount: 5000,
      orderName: '크루아상 2개',
    });
    expect(url).toContain('/payment/toss-checkout');
    expect(url).toContain('orderNumber=PM2026TEST');
    expect(url).toContain('amount=5000');
    expect(url).toContain('orderName=');
  });

  it('orderName이 URL 인코딩된다', () => {
    const url = buildTossCheckoutUrl({
      orderNumber: 'PM2026TEST',
      amount: 1000,
      orderName: '크루아상 & 바게트',
    });
    expect(url).not.toContain('크루아상 & 바게트');
    expect(url).toContain('%26');
  });
});

describe('callTossConfirm', () => {
  beforeEach(() => {
    vi.stubEnv('TOSS_SECRET_KEY', 'test_secret_key');
    vi.stubGlobal('fetch', vi.fn());
  });

  it('Basic auth 헤더와 Idempotency-Key를 포함해 Toss API 호출', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          paymentKey: 'toss_ppk_test',
          orderId: 'PM2026TEST',
          method: '카드',
        }),
        { status: 200 }
      )
    );

    await callTossConfirm({
      paymentKey: 'toss_pk_test',
      orderNumber: 'PM2026TEST',
      amount: 5000,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      TOSS_CONFIRM_URL,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic '),
          'Idempotency-Key': 'confirm:PM2026TEST:toss_pk_test',
        }),
      })
    );
  });

  it('정상 응답 → TossConfirmResult 매핑', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          paymentKey: 'toss_ppk_result',
          orderId: 'PM2026TEST',
          method: '카드',
        }),
        { status: 200 }
      )
    );

    const result = await callTossConfirm({
      paymentKey: 'toss_pk_test',
      orderNumber: 'PM2026TEST',
      amount: 5000,
    });

    expect(result.providerPaymentKey).toBe('toss_ppk_result');
    expect(result.providerOrderId).toBe('PM2026TEST');
    expect(result.method).toBe('card');
    expect(result.methodDetail).toBeNull();
  });

  it('method 한국어 → PaymentMethod 매핑: 가상계좌', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          paymentKey: 'toss_ppk_va',
          orderId: 'PM2026TEST',
          method: '가상계좌',
        }),
        { status: 200 }
      )
    );
    const result = await callTossConfirm({
      paymentKey: 'toss_pk_va',
      orderNumber: 'PM2026TEST',
      amount: 5000,
    });
    expect(result.method).toBe('virtual_account');
  });

  it('method 한국어 → PaymentMethod 매핑: 간편결제 + easyPay provider', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          paymentKey: 'toss_ppk_ep',
          orderId: 'PM2026TEST',
          method: '간편결제',
          easyPay: { provider: '카카오페이' },
        }),
        { status: 200 }
      )
    );
    const result = await callTossConfirm({
      paymentKey: 'toss_pk_ep',
      orderNumber: 'PM2026TEST',
      amount: 5000,
    });
    expect(result.method).toBe('easy_pay');
    expect(result.methodDetail).toBe('카카오페이');
  });

  it('Toss 에러 응답 { code, message } → PAYMENT_CONFIRM_FAILED', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: 'INVALID_STOPPED_CARD',
          message: '정지된 카드입니다.',
        }),
        { status: 400 }
      )
    );
    await expect(
      callTossConfirm({
        paymentKey: 'toss_pk_err',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.PAYMENT_CONFIRM_FAILED });
  });

  it('ALREADY_PROCESSED_PAYMENT → INVALID_ORDER_STATUS 409', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: 'ALREADY_PROCESSED_PAYMENT',
          message: '이미 처리된 결제입니다.',
        }),
        { status: 400 }
      )
    );
    await expect(
      callTossConfirm({
        paymentKey: 'toss_pk_dup',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODE.INVALID_ORDER_STATUS,
      statusCode: 409,
    });
  });

  it('TOSS_SECRET_KEY 없으면 → INTERNAL_SERVER_ERROR', async () => {
    vi.stubEnv('TOSS_SECRET_KEY', '');
    await expect(
      callTossConfirm({
        paymentKey: 'toss_pk_test',
        orderNumber: 'PM2026TEST',
        amount: 5000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.INTERNAL_SERVER_ERROR });
  });
});
