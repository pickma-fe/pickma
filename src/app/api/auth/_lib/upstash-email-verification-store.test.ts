import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  IssueChallengeInput,
  MarkVerifiedInput,
} from './email-verification-store';

vi.stubEnv('AUTH_EMAIL_HASH_SECRET', 'test-secret-for-unit-tests-32bytes!!');
vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake.upstash.io');
vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');

const {
  mockEval,
  mockGet,
  mockIncr,
  mockExpire,
  mockTtl,
  mockMultiSet,
  mockMultiExec,
  mockRedis,
} = vi.hoisted(() => {
  const evalFn = vi.fn();
  const getFn = vi.fn();
  const incrFn = vi.fn();
  const expireFn = vi.fn();
  const ttlFn = vi.fn();
  const multiSetFn = vi.fn();
  const multiExecFn = vi.fn();
  const multiFn = vi.fn(() => ({
    set: multiSetFn,
    exec: multiExecFn,
  }));
  multiSetFn.mockReturnThis = vi.fn();
  return {
    mockEval: evalFn,
    mockGet: getFn,
    mockIncr: incrFn,
    mockExpire: expireFn,
    mockTtl: ttlFn,
    mockMultiSet: multiSetFn,
    mockMultiExec: multiExecFn,
    mockRedis: {
      eval: evalFn,
      get: getFn,
      incr: incrFn,
      expire: expireFn,
      ttl: ttlFn,
      multi: multiFn,
    },
  };
});

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => mockRedis,
  },
}));

// Import after mock setup
const { UpstashEmailVerificationStore } =
  await import('./upstash-email-verification-store');

const config = {
  otpTtlSeconds: 600,
  verificationTokenTtlSeconds: 1800,
  requestWindowSeconds: 600,
  maxRequestsPerEmail: 3,
  maxRequestsPerIp: 10,
  maxOtpAttempts: 5,
  signupLockTtlSeconds: 30,
};

function makeStore() {
  return new UpstashEmailVerificationStore(config);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockMultiSet.mockReturnThis();
  mockMultiExec.mockResolvedValue([null, null]);
});

describe('checkAndIncrementRequestLimit', () => {
  it('제한 미초과 시 allowed=true를 반환한다', async () => {
    mockEval.mockResolvedValue([1, 1]);
    const store = makeStore();
    const result = await store.checkAndIncrementRequestLimit(
      'emailHash',
      'ipHash'
    );
    expect(result.allowed).toBe(true);
    expect(result.emailCount).toBe(1);
    expect(result.ipCount).toBe(1);
  });

  it('email 제한 초과 시 allowed=false를 반환한다', async () => {
    mockEval.mockResolvedValue([4, 1]);
    mockTtl.mockResolvedValue(300);
    const store = makeStore();
    const result = await store.checkAndIncrementRequestLimit(
      'emailHash',
      'ipHash'
    );
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('IP 제한 초과 시 allowed=false를 반환한다', async () => {
    mockEval.mockResolvedValue([1, 11]);
    mockTtl.mockResolvedValue(200);
    const store = makeStore();
    const result = await store.checkAndIncrementRequestLimit(
      'emailHash',
      'ipHash'
    );
    expect(result.allowed).toBe(false);
  });
});

describe('issueChallenge', () => {
  it('새 challenge를 저장하고 current pointer를 업데이트한다', async () => {
    mockGet.mockResolvedValue(null);
    const store = makeStore();
    const input: IssueChallengeInput = {
      challengeId: 'new-chal-id',
      emailHash: 'emailHash',
      otpHash: 'otpHash',
      expiresAt: new Date(Date.now() + 600000),
    };
    await expect(store.issueChallenge(input)).resolves.not.toThrow();
    expect(mockMultiExec).toHaveBeenCalled();
  });

  it('이전 challenge가 있으면 superseded 처리를 시도한다', async () => {
    mockGet.mockResolvedValue('old-chal-id');
    mockEval.mockResolvedValue(1);
    const store = makeStore();
    const input: IssueChallengeInput = {
      challengeId: 'new-chal-id',
      emailHash: 'emailHash',
      otpHash: 'otpHash',
      expiresAt: new Date(Date.now() + 600000),
    };
    await store.issueChallenge(input);
    expect(mockEval).toHaveBeenCalled();
  });
});

describe('getActiveChallenge', () => {
  it('active challenge가 없으면 null을 반환한다', async () => {
    mockGet.mockResolvedValue(null);
    const store = makeStore();
    const result = await store.getActiveChallenge('emailHash');
    expect(result).toBeNull();
  });

  it('current pointer는 있지만 challenge 데이터가 없으면 null을 반환한다', async () => {
    mockGet.mockResolvedValueOnce('chal-id').mockResolvedValueOnce(null);
    const store = makeStore();
    const result = await store.getActiveChallenge('emailHash');
    expect(result).toBeNull();
  });

  it('active challenge가 있으면 Challenge 객체를 반환한다', async () => {
    const record = {
      challengeId: 'chal-id',
      emailHash: 'emailHash',
      otpHash: 'hash123',
      status: 'sent',
      expiresAtMs: Date.now() + 600000,
      createdAtMs: Date.now(),
    };
    mockGet
      .mockResolvedValueOnce('chal-id')
      .mockResolvedValueOnce(JSON.stringify(record));
    const store = makeStore();
    const result = await store.getActiveChallenge('emailHash');
    expect(result).not.toBeNull();
    expect(result?.challengeId).toBe('chal-id');
    expect(result?.status).toBe('sent');
    expect(result?.expiresAt).toBeInstanceOf(Date);
  });
});

describe('incrementAttempt', () => {
  it('첫 번째 increment 시 expire를 설정한다', async () => {
    mockIncr.mockResolvedValue(1);
    const store = makeStore();
    const count = await store.incrementAttempt('chal-id');
    expect(count).toBe(1);
    expect(mockExpire).toHaveBeenCalledWith(
      expect.any(String),
      config.otpTtlSeconds
    );
  });

  it('두 번째 이후 increment 시 expire를 설정하지 않는다', async () => {
    mockIncr.mockResolvedValue(2);
    const store = makeStore();
    await store.incrementAttempt('chal-id');
    expect(mockExpire).not.toHaveBeenCalled();
  });
});

describe('markChallengeSent', () => {
  it('active challenge가 일치하면 true를 반환한다', async () => {
    mockEval.mockResolvedValue(1);
    const store = makeStore();
    const result = await store.markChallengeSent('chal-id', 'emailHash');
    expect(result).toBe(true);
  });

  it('active challenge가 불일치하면 false를 반환한다 (이전 challenge 보호)', async () => {
    mockEval.mockResolvedValue(0);
    const store = makeStore();
    const result = await store.markChallengeSent('old-chal-id', 'emailHash');
    expect(result).toBe(false);
  });
});

describe('markChallengeSendFailed', () => {
  it('active challenge가 일치하면 true를 반환한다', async () => {
    mockEval.mockResolvedValue(1);
    const store = makeStore();
    const result = await store.markChallengeSendFailed('chal-id', 'emailHash');
    expect(result).toBe(true);
  });

  it('active challenge가 불일치하면 false를 반환한다', async () => {
    mockEval.mockResolvedValue(0);
    const store = makeStore();
    const result = await store.markChallengeSendFailed(
      'old-chal-id',
      'emailHash'
    );
    expect(result).toBe(false);
  });
});

describe('markVerified', () => {
  it('active challenge가 일치하면 true를 반환한다', async () => {
    mockEval.mockResolvedValue(1);
    const store = makeStore();
    const input: MarkVerifiedInput = {
      challengeId: 'chal-id',
      emailHash: 'emailHash',
      verificationTokenHash: 'tokenHash',
      tokenExpiresAt: new Date(Date.now() + 1800000),
    };
    const result = await store.markVerified(input);
    expect(result).toBe(true);
  });

  it('active challenge가 불일치하면 false를 반환한다', async () => {
    mockEval.mockResolvedValue(0);
    const store = makeStore();
    const input: MarkVerifiedInput = {
      challengeId: 'stale-chal-id',
      emailHash: 'emailHash',
      verificationTokenHash: 'tokenHash',
      tokenExpiresAt: new Date(Date.now() + 1800000),
    };
    const result = await store.markVerified(input);
    expect(result).toBe(false);
  });
});

describe('beginSignupWithVerificationToken', () => {
  it('verified 상태 token은 ok=true를 반환한다', async () => {
    mockEval.mockResolvedValue([1, 0]);
    const store = makeStore();
    const result = await store.beginSignupWithVerificationToken(
      'tokenHash',
      'emailHash'
    );
    expect(result.ok).toBe(true);
  });

  it('signup_in_progress 상태 token은 alreadyInProgress=true를 반환한다', async () => {
    mockEval.mockResolvedValue([2, 15]);
    const store = makeStore();
    const result = await store.beginSignupWithVerificationToken(
      'tokenHash',
      'emailHash'
    );
    expect(result.ok).toBe(false);
    expect(result.alreadyInProgress).toBe(true);
    expect(result.retryAfterSeconds).toBe(15);
  });

  it('invalid token은 ok=false를 반환한다', async () => {
    mockEval.mockResolvedValue([0, 0]);
    const store = makeStore();
    const result = await store.beginSignupWithVerificationToken(
      'badToken',
      'emailHash'
    );
    expect(result.ok).toBe(false);
    expect(result.alreadyInProgress).toBeUndefined();
  });
});

describe('completeSignupWithVerificationToken', () => {
  it('오류 없이 완료된다', async () => {
    mockEval.mockResolvedValue(1);
    const store = makeStore();
    await expect(
      store.completeSignupWithVerificationToken('tokenHash')
    ).resolves.not.toThrow();
  });
});

describe('releaseSignupVerificationToken', () => {
  it('오류 없이 완료된다', async () => {
    mockEval.mockResolvedValue(1);
    const store = makeStore();
    await expect(
      store.releaseSignupVerificationToken('tokenHash')
    ).resolves.not.toThrow();
  });
});
