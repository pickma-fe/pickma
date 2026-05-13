import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { GET } from './route';

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

function makeRequest(search = '') {
  return new NextRequest(
    `http://localhost/api/payments/mock/checkout${search ? `?${search}` : ''}`
  );
}

describe('GET /api/payments/mock/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API_MOCK_ENABLED=false', () => {
    it('404 반환', async () => {
      vi.mocked(isApiMockEnabled).mockReturnValue(false);
      const res = await GET(makeRequest('orderNumber=PM2026TEST'));
      expect(res.status).toBe(404);
    });
  });

  describe('API_MOCK_ENABLED=true', () => {
    beforeEach(() => {
      vi.mocked(isApiMockEnabled).mockReturnValue(true);
    });

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
  });
});
