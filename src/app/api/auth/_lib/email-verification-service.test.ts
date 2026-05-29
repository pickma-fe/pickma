import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_CODE } from '@/lib/errors/errorCodes';

vi.stubEnv('AUTH_EMAIL_HASH_SECRET', 'test-secret-for-unit-tests-32bytes!!');

const { mockStore, mockMaybeSingle, mockSendOtpEmail } = vi.hoisted(() => ({
  mockStore: {
    checkAndIncrementRequestLimit: vi.fn(),
    issueChallenge: vi.fn(),
    markChallengeSent: vi.fn(),
    markChallengeSendFailed: vi.fn(),
    getActiveChallenge: vi.fn(),
    incrementAttempt: vi.fn(),
    markVerified: vi.fn(),
  },
  mockMaybeSingle: vi.fn(),
  mockSendOtpEmail: vi.fn(),
}));

vi.mock('./upstash-email-verification-store', () => ({
  getEmailVerificationStore: () => mockStore,
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mockMaybeSingle }),
      }),
    }),
  }),
}));

vi.mock('./email-service', () => ({
  sendOtpEmail: mockSendOtpEmail,
}));

import { hashValue } from './email-verification-keys';
import {
  requestEmailVerification,
  verifyEmailOtp,
} from './email-verification-service';
import type { Challenge } from './email-verification-store';

const EMAIL = 'test@example.com';
const IP = '127.0.0.1';
const CHALLENGE_ID = 'a'.repeat(32);
const TEST_OTP = '123456';

function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return {
    challengeId: CHALLENGE_ID,
    emailHash: hashValue(EMAIL),
    otpHash: hashValue(CHALLENGE_ID + ':' + TEST_OTP),
    status: 'sent',
    expiresAt: new Date(Date.now() + 600_000),
    createdAt: new Date(),
    ...overrides,
  };
}

describe('requestEmailVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.checkAndIncrementRequestLimit.mockResolvedValue({
      allowed: true,
      emailCount: 1,
      ipCount: 1,
    });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockStore.issueChallenge.mockResolvedValue(undefined);
    mockSendOtpEmail.mockResolvedValue(undefined);
    mockStore.markChallengeSent.mockResolvedValue(true);
    mockStore.markChallengeSendFailed.mockResolvedValue(true);
  });

  it('저장소 조회 실패 시 AUTH_EMAIL_STORE_UNAVAILABLE를 던진다', async () => {
    mockStore.checkAndIncrementRequestLimit.mockRejectedValue(
      new Error('Redis error')
    );

    await expect(requestEmailVerification(EMAIL, IP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE,
      statusCode: 503,
    });
  });

  it('rate limit 초과 시 RATE_LIMIT_EXCEEDED를 던진다', async () => {
    mockStore.checkAndIncrementRequestLimit.mockResolvedValue({
      allowed: false,
      emailCount: 5,
      ipCount: 5,
    });

    await expect(requestEmailVerification(EMAIL, IP)).rejects.toMatchObject({
      code: ERROR_CODE.RATE_LIMIT_EXCEEDED,
      statusCode: 429,
    });
  });

  it('DB 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: new Error('DB error'),
    });

    await expect(requestEmailVerification(EMAIL, IP)).rejects.toMatchObject({
      code: ERROR_CODE.INTERNAL_SERVER_ERROR,
      statusCode: 500,
    });
  });

  it('이미 가입된 이메일이면 AUTH_EMAIL_ALREADY_EXISTS를 던진다', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'user-1' }, error: null });

    await expect(requestEmailVerification(EMAIL, IP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_ALREADY_EXISTS,
      statusCode: 409,
    });
  });

  it('issueChallenge 실패 시 AUTH_EMAIL_STORE_UNAVAILABLE를 던진다', async () => {
    mockStore.issueChallenge.mockRejectedValue(new Error('Redis error'));

    await expect(requestEmailVerification(EMAIL, IP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE,
    });
  });

  it('이메일 발송 실패 시 AUTH_EMAIL_SEND_FAILED를 던지고 markChallengeSendFailed를 호출한다', async () => {
    mockSendOtpEmail.mockRejectedValue(new Error('SMTP error'));

    await expect(requestEmailVerification(EMAIL, IP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_SEND_FAILED,
      statusCode: 502,
    });
    expect(mockStore.markChallengeSendFailed).toHaveBeenCalled();
  });

  it('markChallengeSent 실패 시 AUTH_EMAIL_STORE_UNAVAILABLE를 던진다', async () => {
    mockStore.markChallengeSent.mockRejectedValue(new Error('Redis error'));

    await expect(requestEmailVerification(EMAIL, IP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE,
    });
  });

  it('markChallengeSent가 false를 반환하면 AUTH_EMAIL_STORE_UNAVAILABLE를 던진다', async () => {
    mockStore.markChallengeSent.mockResolvedValue(false);

    await expect(requestEmailVerification(EMAIL, IP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE,
    });
  });

  it('성공 시 challengeId와 expiresAt을 반환한다', async () => {
    const result = await requestEmailVerification(EMAIL, IP);

    expect(result.challengeId).toBeTypeOf('string');
    expect(result.challengeId).toHaveLength(32);
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('verifyEmailOtp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.getActiveChallenge.mockResolvedValue(makeChallenge());
    mockStore.incrementAttempt.mockResolvedValue(1);
    mockStore.markVerified.mockResolvedValue(true);
  });

  it('저장소 조회 실패 시 AUTH_EMAIL_STORE_UNAVAILABLE를 던진다', async () => {
    mockStore.getActiveChallenge.mockRejectedValue(new Error('Redis error'));

    await expect(verifyEmailOtp(EMAIL, TEST_OTP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE,
      statusCode: 503,
    });
  });

  it('active challenge 없으면 AUTH_EMAIL_OTP_EXPIRED를 던진다', async () => {
    mockStore.getActiveChallenge.mockResolvedValue(null);

    await expect(verifyEmailOtp(EMAIL, TEST_OTP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_OTP_EXPIRED,
    });
  });

  it('challenge status가 sent가 아니면 AUTH_EMAIL_OTP_EXPIRED를 던진다', async () => {
    mockStore.getActiveChallenge.mockResolvedValue(
      makeChallenge({ status: 'pending' })
    );

    await expect(verifyEmailOtp(EMAIL, TEST_OTP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_OTP_EXPIRED,
    });
  });

  it('challenge가 만료됐으면 AUTH_EMAIL_OTP_EXPIRED를 던진다', async () => {
    mockStore.getActiveChallenge.mockResolvedValue(
      makeChallenge({ expiresAt: new Date(Date.now() - 1000) })
    );

    await expect(verifyEmailOtp(EMAIL, TEST_OTP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_OTP_EXPIRED,
    });
  });

  it('시도 횟수 초과 시 AUTH_EMAIL_OTP_ATTEMPT_LIMIT_EXCEEDED를 던진다', async () => {
    mockStore.incrementAttempt.mockResolvedValue(6);

    await expect(verifyEmailOtp(EMAIL, TEST_OTP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_OTP_ATTEMPT_LIMIT_EXCEEDED,
      statusCode: 429,
    });
  });

  it('OTP 불일치 시 AUTH_EMAIL_OTP_INVALID를 던진다', async () => {
    await expect(verifyEmailOtp(EMAIL, '000000')).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_OTP_INVALID,
      statusCode: 400,
    });
  });

  it('markVerified가 false를 반환하면 AUTH_EMAIL_OTP_EXPIRED를 던진다', async () => {
    mockStore.markVerified.mockResolvedValue(false);

    await expect(verifyEmailOtp(EMAIL, TEST_OTP)).rejects.toMatchObject({
      code: ERROR_CODE.AUTH_EMAIL_OTP_EXPIRED,
    });
  });

  it('성공 시 verificationToken과 expiresAt을 반환한다', async () => {
    const result = await verifyEmailOtp(EMAIL, TEST_OTP);

    expect(result.verificationToken).toBeTypeOf('string');
    expect(result.verificationToken.length).toBeGreaterThan(0);
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
