import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';

const { mockCompleteEmailSignup } = vi.hoisted(() => ({
  mockCompleteEmailSignup: vi.fn(),
}));

vi.mock('../_lib/signup-service', () => ({
  completeEmailSignup: mockCompleteEmailSignup,
}));

import { GET, POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/email-signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  email: 'test@example.com',
  verificationToken: 'valid-token',
  password: 'password123',
  name: '테스트',
};

describe('POST /api/auth/email-signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('mock 모드에서 고정 성공 응답을 반환한다', async () => {
    vi.stubEnv('API_MOCK_ENABLED', 'true');

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
  });

  it('이메일 형식이 유효하지 않으면 400을 반환한다', async () => {
    const res = await POST(
      makeRequest({ ...VALID_BODY, email: 'not-an-email' })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('비밀번호가 8자 미만이면 400을 반환한다', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, password: 'short' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('verificationToken이 없으면 400을 반환한다', async () => {
    const res = await POST(
      makeRequest({ ...VALID_BODY, verificationToken: '' })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
  });

  it('서비스 오류를 HTTP 상태코드로 매핑한다', async () => {
    mockCompleteEmailSignup.mockRejectedValue(
      new AppError(ERROR_CODE.AUTH_EMAIL_VERIFICATION_TOKEN_INVALID, 400)
    );

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe(
      ERROR_CODE.AUTH_EMAIL_VERIFICATION_TOKEN_INVALID
    );
  });

  it('성공 시 200과 null data를 반환한다', async () => {
    mockCompleteEmailSignup.mockResolvedValue(undefined);

    const res = await POST(makeRequest(VALID_BODY));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
    expect(mockCompleteEmailSignup).toHaveBeenCalledWith(
      VALID_BODY.email,
      VALID_BODY.verificationToken,
      VALID_BODY.password,
      VALID_BODY.name
    );
  });
});

describe('GET /api/auth/email-signup', () => {
  it('501을 반환한다', async () => {
    const res = GET();

    expect(res.status).toBe(501);
  });
});
