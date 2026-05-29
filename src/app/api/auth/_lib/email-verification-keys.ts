import { createHmac } from 'crypto';

function getHashSecret(): string {
  const secret = process.env.AUTH_EMAIL_HASH_SECRET;
  if (!secret) {
    throw new Error('AUTH_EMAIL_HASH_SECRET is not set');
  }
  return secret;
}

export function hashValue(value: string): string {
  return createHmac('sha256', getHashSecret()).update(value).digest('hex');
}

export const redisKeys = {
  currentChallenge: (emailHash: string) =>
    `auth:email:signup:${emailHash}:current`,
  challenge: (challengeId: string) =>
    `auth:email:signup:challenge:${challengeId}`,
  verificationToken: (tokenHash: string) =>
    `auth:email:signup:verify:${tokenHash}`,
  rateLimitEmail: (emailHash: string) =>
    `auth:email:signup:rate:email:${emailHash}`,
  rateLimitIp: (ipHash: string) => `auth:email:signup:rate:ip:${ipHash}`,
  attemptCount: (challengeId: string) =>
    `auth:email:signup:attempt:${challengeId}`,
} as const;
