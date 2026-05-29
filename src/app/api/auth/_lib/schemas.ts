import { z } from 'zod';

export const requestEmailVerificationSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.toLowerCase().trim()),
});

export const verifyEmailOtpSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.toLowerCase().trim()),
  otp: z.string().regex(/^\d{6}$/, '6자리 숫자를 입력해 주세요.'),
});

export const completeEmailSignupSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.toLowerCase().trim()),
  verificationToken: z.string().min(1),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  name: z.string().min(1).max(50),
});
