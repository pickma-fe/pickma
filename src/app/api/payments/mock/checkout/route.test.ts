import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { GET } from './route';

function makeRequest(search = '') {
  return new NextRequest(
    `http://localhost/api/payments/mock/checkout${search ? `?${search}` : ''}`
  );
}

describe('GET /api/payments/mock/checkout', () => {
  it('orderNumber 있음 → 200 HTML', async () => {
    const res = await GET(makeRequest('orderNumber=PM2026TEST'));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('PM2026TEST');
  });

  it('orderNumber 없음 → 400', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it('orderNumber를 HTML escape 한다', async () => {
    const res = await GET(makeRequest('orderNumber=%3Cscript%3E'));
    const html = await res.text();
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<strong><script></strong>');
  });
});
