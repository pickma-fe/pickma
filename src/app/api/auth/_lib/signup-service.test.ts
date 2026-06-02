import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_CODE } from '@/lib/errors/errorCodes';

vi.stubEnv('AUTH_EMAIL_HASH_SECRET', 'test-secret-for-unit-tests-32bytes!!');

const { mockStore, mockCreateUser, mockDeleteUser, mockInsert } = vi.hoisted(
  () => ({
    mockStore: {
      beginSignupWithVerificationToken: vi.fn(),
      completeSignupWithVerificationToken: vi.fn(),
      releaseSignupVerificationToken: vi.fn(),
    },
    mockCreateUser: vi.fn(),
    mockDeleteUser: vi.fn(),
    mockInsert: vi.fn(),
  })
);

vi.mock('./upstash-email-verification-store', () => ({
  getEmailVerificationStore: () => mockStore,
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: () => ({
    auth: { admin: { createUser: mockCreateUser, deleteUser: mockDeleteUser } },
    from: () => ({ insert: mockInsert }),
  }),
}));

import { completeEmailSignup } from './signup-service';

const EMAIL = 'test@example.com';
const TOKEN = 'valid-verification-token';
const PASSWORD = 'password123';
const NAME = '테스트';
const AUTH_USER_ID = 'auth-user-uuid';

describe('completeEmailSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.beginSignupWithVerificationToken.mockResolvedValue({ ok: true });
    mockCreateUser.mockResolvedValue({
      data: { user: { id: AUTH_USER_ID } },
      error: null,
    });
    mockInsert.mockResolvedValue({ error: null });
    mockStore.completeSignupWithVerificationToken.mockResolvedValue(undefined);
    mockStore.releaseSignupVerificationToken.mockResolvedValue(undefined);
    mockDeleteUser.mockResolvedValue({ error: null });
  });

  it('저장소 조회 실패 시 AUTH_EMAIL_STORE_UNAVAILABLE를 던진다', async () => {
    mockStore.beginSignupWithVerificationToken.mockRejectedValue(
      new Error('Redis error')
    );

    await expect(
      completeEmailSignup(EMAIL, TOKEN, PASSWORD, NAME, false)
    ).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE,
      statusCode: 503,
    });
  });

  it('가입 진행 중이면 AUTH_EMAIL_SIGNUP_IN_PROGRESS를 던진다', async () => {
    mockStore.beginSignupWithVerificationToken.mockResolvedValue({
      ok: false,
      alreadyInProgress: true,
      retryAfterSeconds: 10,
    });

    await expect(
      completeEmailSignup(EMAIL, TOKEN, PASSWORD, NAME, false)
    ).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_SIGNUP_IN_PROGRESS,
      statusCode: 409,
    });
  });

  it('token이 유효하지 않으면 AUTH_EMAIL_VERIFICATION_TOKEN_INVALID를 던진다', async () => {
    mockStore.beginSignupWithVerificationToken.mockResolvedValue({ ok: false });

    await expect(
      completeEmailSignup(EMAIL, TOKEN, PASSWORD, NAME, false)
    ).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_VERIFICATION_TOKEN_INVALID,
      statusCode: 400,
    });
  });

  it('이미 가입된 이메일이면 AUTH_EMAIL_ALREADY_EXISTS를 던지고 token을 소비한다', async () => {
    mockCreateUser.mockResolvedValue({
      data: null,
      error: { status: 422, message: 'User already registered' },
    });

    await expect(
      completeEmailSignup(EMAIL, TOKEN, PASSWORD, NAME, false)
    ).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_ALREADY_EXISTS,
      statusCode: 409,
    });
    expect(mockStore.completeSignupWithVerificationToken).toHaveBeenCalled();
  });

  it('createUser 실패 시 INTERNAL_SERVER_ERROR를 던지고 token을 복구한다', async () => {
    mockCreateUser.mockResolvedValue({
      data: null,
      error: { status: 500, message: 'Internal error' },
    });

    await expect(
      completeEmailSignup(EMAIL, TOKEN, PASSWORD, NAME, false)
    ).rejects.toMatchObject({
      code: ERROR_CODE.INTERNAL_SERVER_ERROR,
      statusCode: 500,
    });
    expect(mockStore.releaseSignupVerificationToken).toHaveBeenCalled();
  });

  it('users insert 실패 후 deleteUser 성공 시 token을 복구한다', async () => {
    mockInsert.mockResolvedValue({ error: new Error('Insert failed') });
    mockDeleteUser.mockResolvedValue({ error: null });

    await expect(
      completeEmailSignup(EMAIL, TOKEN, PASSWORD, NAME, false)
    ).rejects.toMatchObject({
      code: ERROR_CODE.INTERNAL_SERVER_ERROR,
    });
    expect(mockDeleteUser).toHaveBeenCalledWith(AUTH_USER_ID);
    expect(mockStore.releaseSignupVerificationToken).toHaveBeenCalled();
  });

  it('users insert 실패 후 deleteUser 실패 시 token을 소비한다', async () => {
    mockInsert.mockResolvedValue({ error: new Error('Insert failed') });
    mockDeleteUser.mockResolvedValue({ error: new Error('Delete failed') });

    await expect(
      completeEmailSignup(EMAIL, TOKEN, PASSWORD, NAME, false)
    ).rejects.toMatchObject({
      code: ERROR_CODE.INTERNAL_SERVER_ERROR,
    });
    expect(mockStore.completeSignupWithVerificationToken).toHaveBeenCalled();
  });

  it('성공 시 token을 소비한다', async () => {
    await completeEmailSignup(EMAIL, TOKEN, PASSWORD, NAME, false);

    expect(mockStore.completeSignupWithVerificationToken).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        marketing_agreed: false,
        marketing_agreed_at: null,
      })
    );
  });

  it('마케팅 수신 동의 시 users에 동의 상태와 시각을 저장한다', async () => {
    await completeEmailSignup(EMAIL, TOKEN, PASSWORD, NAME, true);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        marketing_agreed: true,
        marketing_agreed_at: expect.any(String),
      })
    );
  });
});
