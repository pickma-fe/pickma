export interface EmailVerificationConfig {
  otpTtlSeconds: number;
  verificationTokenTtlSeconds: number;
  requestWindowSeconds: number;
  maxRequestsPerEmail: number;
  maxRequestsPerIp: number;
  maxOtpAttempts: number;
  signupLockTtlSeconds: number;
}

export const defaultEmailVerificationConfig: EmailVerificationConfig = {
  otpTtlSeconds: Number(process.env.AUTH_EMAIL_OTP_TTL_SECONDS ?? 600),
  verificationTokenTtlSeconds: Number(
    process.env.AUTH_EMAIL_VERIFICATION_TOKEN_TTL_SECONDS ?? 1800
  ),
  requestWindowSeconds: 600,
  maxRequestsPerEmail: 3,
  maxRequestsPerIp: 10,
  maxOtpAttempts: 5,
  signupLockTtlSeconds: 30,
};
