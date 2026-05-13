import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { GET } from './route';

const VALID_PARAMS =
  'orderNumber=PM2026TEST&provider=toss&amount=5000&successUrl=http%3A%2F%2Flocalhost%2Fpayment%2Fsuccess';

function makeRequest(search = '') {
  return new NextRequest(
    `http://localhost/api/payments/mock/checkout${search ? `?${search}` : ''}`
  );
}

describe('GET /api/payments/mock/checkout', () => {
  it('필수 파라미터 모두 있음 → 200 HTML', async () => {
    const res = await GET(makeRequest(VALID_PARAMS));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('PM2026TEST');
    expect(html).toContain('결제하기');
  });

  it('파라미터 누락 → 400', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it('orderNumber만 있음 → 400', async () => {
    const res = await GET(makeRequest('orderNumber=PM2026TEST'));
    expect(res.status).toBe(400);
  });

  it('orderNumber를 HTML escape 한다', async () => {
    const params =
      'orderNumber=%3Cscript%3E&provider=toss&amount=5000&successUrl=http%3A%2F%2Flocalhost%2Fpayment%2Fsuccess';
    const res = await GET(makeRequest(params));
    const html = await res.text();
    expect(html).toContain('&lt;script&gt;');
  });

  it('결제하기 링크가 successUrl을 포함한다', async () => {
    const res = await GET(makeRequest(VALID_PARAMS));
    const html = await res.text();
    expect(html).toContain('payment/success');
    expect(html).toContain('PM2026TEST');
  });
});
