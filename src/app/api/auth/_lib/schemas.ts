import { z } from 'zod';

const normalizedEmailSchema = z.string().trim().toLowerCase().email();

export const requestEmailVerificationSchema = z.object({
  email: normalizedEmailSchema,
});

export const verifyEmailOtpSchema = z.object({
  email: normalizedEmailSchema,
  otp: z.string().regex(/^\d{6}$/, '6자리 숫자를 입력해 주세요.'),
});

export const completeEmailSignupSchema = z.object({
  email: normalizedEmailSchema,
  verificationToken: z.string().trim().min(1),
  password: z.string().min(10, '비밀번호는 10자 이상이어야 합니다.'),
  name: z.string().min(1).max(50),
  marketingAgreed: z.boolean(),
});
