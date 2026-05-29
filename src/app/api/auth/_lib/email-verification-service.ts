import { randomBytes, randomInt } from 'crypto';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { sendOtpEmail } from './email-service';
import { defaultEmailVerificationConfig } from './email-verification-config';
import { hashValue } from './email-verification-keys';
import { getEmailVerificationStore } from './upstash-email-verification-store';

export async function requestEmailVerification(
  email: string,
  ip: string
): Promise<{ challengeId: string; expiresAt: Date }> {
  const store = getEmailVerificationStore();
  const config = defaultEmailVerificationConfig;
  const emailHash = hashValue(email);
  const ipHash = hashValue(ip);

  let limitResult;
  try {
    limitResult = await store.checkAndIncrementRequestLimit(emailHash, ipHash);
  } catch {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE, 503);
  }

  if (!limitResult.allowed) {
    throw new AppError(ERROR_CODE.RATE_LIMIT_EXCEEDED, 429);
  }

  const supabase = createServiceRoleClient();
  const { data: existing, error: existingError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingError) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  if (existing) {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_ALREADY_EXISTS, 409);
  }

  const challengeId = randomBytes(16).toString('hex');
  const otp = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const expiresAt = new Date(Date.now() + config.otpTtlSeconds * 1000);
  const otpHash = hashValue(challengeId + ':' + otp);

  try {
    await store.issueChallenge({ challengeId, emailHash, otpHash, expiresAt });
  } catch {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE, 503);
  }

  try {
    await sendOtpEmail(email, otp);
  } catch {
    await store.markChallengeSendFailed(challengeId, emailHash).catch(() => {});
    throw new AppError(ERROR_CODE.AUTH_EMAIL_SEND_FAILED, 502);
  }

  let sent: boolean;
  try {
    sent = await store.markChallengeSent(challengeId, emailHash);
  } catch {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE, 503);
  }
  if (!sent) {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE, 503);
  }

  return { challengeId, expiresAt };
}

export async function verifyEmailOtp(
  email: string,
  otp: string
): Promise<{ verificationToken: string; expiresAt: Date }> {
  const store = getEmailVerificationStore();
  const config = defaultEmailVerificationConfig;
  const emailHash = hashValue(email);

  let challenge;
  try {
    challenge = await store.getActiveChallenge(emailHash);
  } catch {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_STORE_UNAVAILABLE, 503);
  }

  if (challenge?.status !== 'sent') {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_OTP_EXPIRED, 400);
  }

  if (challenge.expiresAt < new Date()) {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_OTP_EXPIRED, 400);
  }

  const attemptCount = await store.incrementAttempt(challenge.challengeId);
  if (attemptCount > config.maxOtpAttempts) {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_OTP_ATTEMPT_LIMIT_EXCEEDED, 429);
  }

  const otpHash = hashValue(challenge.challengeId + ':' + otp);
  if (challenge.otpHash !== otpHash) {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_OTP_INVALID, 400);
  }

  const verificationToken = randomBytes(32).toString('base64url');
  const tokenHash = hashValue(verificationToken);
  const tokenExpiresAt = new Date(
    Date.now() + config.verificationTokenTtlSeconds * 1000
  );

  const marked = await store.markVerified({
    challengeId: challenge.challengeId,
    emailHash,
    verificationTokenHash: tokenHash,
    tokenExpiresAt,
  });

  if (!marked) {
    throw new AppError(ERROR_CODE.AUTH_EMAIL_OTP_EXPIRED, 400);
  }

  return { verificationToken, expiresAt: tokenExpiresAt };
}
