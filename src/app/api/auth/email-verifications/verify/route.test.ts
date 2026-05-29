import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';

const { mockVerifyEmailOtp } = vi.hoisted(() => ({
  mockVerifyEmailOtp: vi.fn(),
}));

vi.mock('../../_lib/email-verification-service', () => ({
  verifyEmailOtp: mockVerifyEmailOtp,
}));

import { GET, POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest(
    'http://localhost/api/auth/email-verifications/verify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

const VALID_BODY = { email: 'test@example.com', otp: '123456' };

describe('POST /api/auth/email-verifications/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('mock 모드에서 고정 성공 응답을 반환한다', async () => {
    vi.stubEnv('API_MOCK_ENABLED', 'true');

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.verificationToken).toBe('mock-verification-token');
  });

  it('이메일 형식이 유효하지 않으면 400을 반환한다', async () => {
    const res = await POST(
      makeRequest({ email: 'not-an-email', otp: '123456' })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('OTP가 6자리 숫자가 아니면 400을 반환한다', async () => {
    const res = await POST(
      makeRequest({ email: 'test@example.com', otp: 'abcdef' })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('서비스 오류를 HTTP 상태코드로 매핑한다', async () => {
    mockVerifyEmailOtp.mockRejectedValue(
      new AppError(ERROR_CODE.AUTH_EMAIL_OTP_INVALID, 400)
    );

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe(ERROR_CODE.AUTH_EMAIL_OTP_INVALID);
  });

  it('성공 시 verificationToken과 expiresAt을 반환한다', async () => {
    const expiresAt = new Date(Date.now() + 1_800_000);
    mockVerifyEmailOtp.mockResolvedValue({
      verificationToken: 'test-token',
      expiresAt,
    });

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.verificationToken).toBe('test-token');
    expect(body.data.expiresAt).toBe(expiresAt.toISOString());
  });
});

describe('GET /api/auth/email-verifications/verify', () => {
  it('501을 반환한다', async () => {
    const res = GET();

    expect(res.status).toBe(501);
  });
});
