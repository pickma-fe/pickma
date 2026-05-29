import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hashValue, redisKeys } from './email-verification-keys';

vi.stubEnv('AUTH_EMAIL_HASH_SECRET', 'test-secret-for-unit-tests-32bytes!!');

describe('hashValue', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv(
      'AUTH_EMAIL_HASH_SECRET',
      'test-secret-for-unit-tests-32bytes!!'
    );
  });

  it('같은 입력은 같은 hash를 반환한다', () => {
    expect(hashValue('user@example.com')).toBe(hashValue('user@example.com'));
  });

  it('다른 입력은 다른 hash를 반환한다', () => {
    expect(hashValue('user@example.com')).not.toBe(
      hashValue('other@example.com')
    );
  });

  it('결과에 원본 값이 포함되지 않는다', () => {
    const email = 'user@example.com';
    const result = hashValue(email);
    expect(result).not.toContain(email);
    expect(result).not.toContain('user');
    expect(result).not.toContain('example');
  });

  it('AUTH_EMAIL_HASH_SECRET 미설정 시 오류를 던진다', () => {
    vi.unstubAllEnvs();
    expect(() => hashValue('any')).toThrow('AUTH_EMAIL_HASH_SECRET is not set');
  });
});

describe('redisKeys', () => {
  it('currentChallenge 키는 emailHash를 포함한다', () => {
    const key = redisKeys.currentChallenge('abc123');
    expect(key).toContain('abc123');
    expect(key).toMatch(/^auth:email:signup:.+:current$/);
  });

  it('challenge 키는 challengeId를 포함한다', () => {
    const key = redisKeys.challenge('challenge-id-xyz');
    expect(key).toContain('challenge-id-xyz');
    expect(key).toMatch(/^auth:email:signup:challenge:/);
  });

  it('verificationToken 키는 tokenHash를 포함한다', () => {
    const key = redisKeys.verificationToken('token-hash-abc');
    expect(key).toContain('token-hash-abc');
    expect(key).toMatch(/^auth:email:signup:verify:/);
  });

  it('rateLimitEmail 키는 emailHash를 포함한다', () => {
    const key = redisKeys.rateLimitEmail('emailhash');
    expect(key).toMatch(/^auth:email:signup:rate:email:/);
  });

  it('rateLimitIp 키는 ipHash를 포함한다', () => {
    const key = redisKeys.rateLimitIp('iphash');
    expect(key).toMatch(/^auth:email:signup:rate:ip:/);
  });

  it('attemptCount 키는 challengeId를 포함한다', () => {
    const key = redisKeys.attemptCount('chal-id');
    expect(key).toMatch(/^auth:email:signup:attempt:/);
  });

  it('raw email 주소가 키에 포함되지 않는다', () => {
    vi.stubEnv(
      'AUTH_EMAIL_HASH_SECRET',
      'test-secret-for-unit-tests-32bytes!!'
    );
    const emailHash = hashValue('user@example.com');
    const key = redisKeys.currentChallenge(emailHash);
    expect(key).not.toContain('user@example.com');
    expect(key).not.toContain('@example');
  });
});
