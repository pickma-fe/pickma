export interface EmailVerificationConfig {
  otpTtlSeconds: number;
  verificationTokenTtlSeconds: number;
  requestWindowSeconds: number;
  maxRequestsPerEmail: number;
  maxRequestsPerIp: number;
  maxOtpAttempts: number;
  signupLockTtlSeconds: number;
}

function parsePositiveInt(envKey: string, fallback: number): number {
  const raw = process.env[envKey];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${envKey} must be a positive integer, got: "${raw}"`);
  }
  return value;
}

export const defaultEmailVerificationConfig: EmailVerificationConfig = {
  otpTtlSeconds: parsePositiveInt('AUTH_EMAIL_OTP_TTL_SECONDS', 600),
  verificationTokenTtlSeconds: parsePositiveInt(
    'AUTH_EMAIL_VERIFICATION_TOKEN_TTL_SECONDS',
    1800
  ),
  requestWindowSeconds: 600,
  maxRequestsPerEmail: 3,
  maxRequestsPerIp: 10,
  maxOtpAttempts: 5,
  signupLockTtlSeconds: 30,
};
