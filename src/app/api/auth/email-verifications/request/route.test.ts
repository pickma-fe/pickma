import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';

const { mockRequestEmailVerification } = vi.hoisted(() => ({
  mockRequestEmailVerification: vi.fn(),
}));

vi.mock('../../_lib/email-verification-service', () => ({
  requestEmailVerification: mockRequestEmailVerification,
}));

import { GET, POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest(
    'http://localhost/api/auth/email-verifications/request',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

describe('POST /api/auth/email-verifications/request', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('API_MOCK_ENABLED', 'false');
  });

  it('mock 모드에서 고정 성공 응답을 반환한다', async () => {
    vi.stubEnv('API_MOCK_ENABLED', 'true');

    const res = await POST(makeRequest({ email: 'test@example.com' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.challengeId).toBe('mock-challenge-id');
  });

  it('이메일 형식이 유효하지 않으면 400을 반환한다', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('body가 없으면 400을 반환한다', async () => {
    const req = new NextRequest(
      'http://localhost/api/auth/email-verifications/request',
      { method: 'POST' }
    );
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('서비스 오류를 HTTP 상태코드로 매핑한다', async () => {
    mockRequestEmailVerification.mockRejectedValue(
      new AppError(ERROR_CODE.RATE_LIMIT_EXCEEDED, 429)
    );

    const res = await POST(makeRequest({ email: 'test@example.com' }));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error.code).toBe(ERROR_CODE.RATE_LIMIT_EXCEEDED);
  });

  it('성공 시 challengeId와 expiresAt을 반환한다', async () => {
    const expiresAt = new Date(Date.now() + 600_000);
    mockRequestEmailVerification.mockResolvedValue({
      challengeId: 'test-challenge-id',
      expiresAt,
    });

    const res = await POST(makeRequest({ email: 'test@example.com' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.challengeId).toBe('test-challenge-id');
    expect(body.data.expiresAt).toBe(expiresAt.toISOString());
  });
});

describe('GET /api/auth/email-verifications/request', () => {
  it('501을 반환한다', async () => {
    const res = GET();

    expect(res.status).toBe(501);
  });
});
