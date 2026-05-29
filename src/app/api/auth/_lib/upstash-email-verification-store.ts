import { Redis } from '@upstash/redis';

import type { EmailVerificationConfig } from './email-verification-config';
import { defaultEmailVerificationConfig } from './email-verification-config';
import { redisKeys } from './email-verification-keys';
import type {
  BeginSignupResult,
  Challenge,
  ChallengeStatus,
  EmailVerificationStore,
  IssueChallengeInput,
  MarkVerifiedInput,
  RequestLimitResult,
  VerificationTokenStatus,
} from './email-verification-store';

interface ChallengeRecord {
  challengeId: string;
  emailHash: string;
  otpHash: string;
  status: ChallengeStatus;
  expiresAtMs: number;
  createdAtMs: number;
}

interface VerificationTokenRecord {
  emailHash: string;
  challengeId: string;
  expiresAtMs: number;
  status: VerificationTokenStatus;
  lockExpiresAtMs?: number;
}

let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = Redis.fromEnv();
  }
  return redisInstance;
}

export class UpstashEmailVerificationStore implements EmailVerificationStore {
  private readonly config: EmailVerificationConfig;

  constructor(config: Partial<EmailVerificationConfig> = {}) {
    this.config = { ...defaultEmailVerificationConfig, ...config };
  }

  async checkAndIncrementRequestLimit(
    emailHash: string,
    ipHash: string
  ): Promise<RequestLimitResult> {
    const redis = getRedis();
    const emailKey = redisKeys.rateLimitEmail(emailHash);
    const ipKey = redisKeys.rateLimitIp(ipHash);
    const window = this.config.requestWindowSeconds;

    /*
     * Lua script: INCR + SET EX only on first increment (atomic per key).
     * Returns [emailCount, ipCount].
     */
    const luaScript = `
      local function incrWithTtl(key, ttl)
        local count = redis.call('INCR', key)
        if count == 1 then
          redis.call('EXPIRE', key, ttl)
        end
        return count
      end
      local emailCount = incrWithTtl(KEYS[1], tonumber(ARGV[1]))
      local ipCount = incrWithTtl(KEYS[2], tonumber(ARGV[1]))
      return {emailCount, ipCount}
    `;

    const [emailCount, ipCount] = await redis.eval(
      luaScript,
      [emailKey, ipKey],
      [String(window)]
    );

    const emailExceeded = emailCount > this.config.maxRequestsPerEmail;
    const ipExceeded = ipCount > this.config.maxRequestsPerIp;

    if (emailExceeded || ipExceeded) {
      const emailTtl = emailExceeded
        ? ((await redis.ttl(emailKey)) ?? window)
        : 0;
      const ipTtl = ipExceeded ? ((await redis.ttl(ipKey)) ?? window) : 0;
      const retryAfterSeconds = Math.max(emailTtl, ipTtl);
      return { allowed: false, retryAfterSeconds, emailCount, ipCount };
    }

    return { allowed: true, emailCount, ipCount };
  }

  async issueChallenge(input: IssueChallengeInput): Promise<void> {
    const redis = getRedis();
    const { challengeId, emailHash, otpHash, expiresAt } = input;
    const ttl = this.config.otpTtlSeconds;
    const currentKey = redisKeys.currentChallenge(emailHash);
    const challengeKey = redisKeys.challenge(challengeId);
    const now = Date.now();

    const record: ChallengeRecord = {
      challengeId,
      emailHash,
      otpHash,
      status: 'pending',
      expiresAtMs: expiresAt.getTime(),
      createdAtMs: now,
    };

    /*
     * 1. Get current challenge id (to supersede it).
     * 2. Write new challenge + update current pointer.
     * 3. Best-effort supersede the old challenge.
     * Steps 1-2 use a transaction (multi) for atomicity.
     */
    const prevChallengeId = await redis.get<string>(currentKey);

    const pipeline = redis.multi();
    pipeline.set(challengeKey, JSON.stringify(record), { ex: ttl });
    pipeline.set(currentKey, challengeId, { ex: ttl });
    await pipeline.exec();

    if (prevChallengeId && prevChallengeId !== challengeId) {
      const prevKey = redisKeys.challenge(prevChallengeId);
      // Best-effort: supersede previous challenge if it is still 'pending' or 'sent'.
      const supersedeLua = `
        local raw = redis.call('GET', KEYS[1])
        if not raw then return 0 end
        local rec = cjson.decode(raw)
        if rec.status == 'pending' or rec.status == 'sent' then
          rec.status = 'superseded'
          redis.call('SET', KEYS[1], cjson.encode(rec), 'KEEPTTL')
          return 1
        end
        return 0
      `;
      await redis.eval(supersedeLua, [prevKey], []).catch(() => {
        /* best-effort */
      });
    }
  }

  async getActiveChallenge(emailHash: string): Promise<Challenge | null> {
    const redis = getRedis();
    const currentKey = redisKeys.currentChallenge(emailHash);
    const challengeId = await redis.get<string>(currentKey);
    if (!challengeId) return null;

    const challengeKey = redisKeys.challenge(challengeId);
    const raw = await redis.get<string>(challengeKey);
    if (!raw) return null;

    const rec: ChallengeRecord =
      typeof raw === 'string' ? JSON.parse(raw) : raw;

    return {
      challengeId: rec.challengeId,
      emailHash: rec.emailHash,
      otpHash: rec.otpHash,
      status: rec.status,
      expiresAt: new Date(rec.expiresAtMs),
      createdAt: new Date(rec.createdAtMs),
    };
  }

  async incrementAttempt(challengeId: string): Promise<number> {
    const redis = getRedis();
    const key = redisKeys.attemptCount(challengeId);
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, this.config.otpTtlSeconds);
    }
    return count;
  }

  async markChallengeSent(
    challengeId: string,
    emailHash: string
  ): Promise<boolean> {
    return this._conditionalChallengeStatusUpdate(
      challengeId,
      emailHash,
      'sent'
    );
  }

  async markChallengeSendFailed(
    challengeId: string,
    emailHash: string
  ): Promise<boolean> {
    return this._conditionalChallengeStatusUpdate(
      challengeId,
      emailHash,
      'send_failed'
    );
  }

  async markVerified(input: MarkVerifiedInput): Promise<boolean> {
    const redis = getRedis();
    const { challengeId, emailHash, verificationTokenHash, tokenExpiresAt } =
      input;
    const currentKey = redisKeys.currentChallenge(emailHash);
    const challengeKey = redisKeys.challenge(challengeId);
    const tokenKey = redisKeys.verificationToken(verificationTokenHash);
    const tokenTtl = this.config.verificationTokenTtlSeconds;

    const tokenRecord: VerificationTokenRecord = {
      emailHash,
      challengeId,
      expiresAtMs: tokenExpiresAt.getTime(),
      status: 'verified',
    };

    /*
     * Atomically:
     * 1. Check that challengeId is still the active challenge for emailHash.
     * 2. Update challenge status to 'verified' and extend TTL.
     * 3. Store verification token.
     */
    const lua = `
      local currentId = redis.call('GET', KEYS[1])
      if currentId ~= ARGV[1] then return 0 end
      local raw = redis.call('GET', KEYS[2])
      if not raw then return 0 end
      local rec = cjson.decode(raw)
      if rec.status ~= 'sent' then return 0 end
      rec.status = 'verified'
      redis.call('SET', KEYS[2], cjson.encode(rec), 'EX', tonumber(ARGV[2]))
      redis.call('SET', KEYS[3], ARGV[3], 'EX', tonumber(ARGV[2]))
      return 1
    `;

    const result = await redis.eval(
      lua,
      [currentKey, challengeKey, tokenKey],
      [challengeId, String(tokenTtl), JSON.stringify(tokenRecord)]
    );

    return result === 1;
  }

  async beginSignupWithVerificationToken(
    verificationTokenHash: string,
    emailHash: string
  ): Promise<BeginSignupResult> {
    const redis = getRedis();
    const tokenKey = redisKeys.verificationToken(verificationTokenHash);
    const lockTtl = this.config.signupLockTtlSeconds;
    const now = Date.now();
    const lockExpiresAtMs = now + lockTtl * 1000;

    /*
     * Atomically:
     * - If token does not exist or emailHash mismatches or status is not 'verified': return 0 (invalid).
     * - If status is 'signup_in_progress' and lock not expired: return 2 (in progress).
     * - If status is 'signup_in_progress' and lock expired: transition back and re-begin (return 1).
     * - If status is 'verified': transition to 'signup_in_progress' with lock TTL: return 1.
     */
    const lua = `
      local raw = redis.call('GET', KEYS[1])
      if not raw then return {0, 0} end
      local rec = cjson.decode(raw)
      if rec.emailHash ~= ARGV[1] then return {0, 0} end
      local nowMs = tonumber(ARGV[2])
      local lockTtl = tonumber(ARGV[3])
      local lockExpiresAtMs = tonumber(ARGV[4])
      if rec.status == 'signup_in_progress' then
        local lockMs = rec.lockExpiresAtMs or 0
        if nowMs < lockMs then
          local retryAfter = math.ceil((lockMs - nowMs) / 1000)
          return {2, retryAfter}
        end
      end
      if rec.status ~= 'verified' and rec.status ~= 'signup_in_progress' then
        return {0, 0}
      end
      rec.status = 'signup_in_progress'
      rec.lockExpiresAtMs = lockExpiresAtMs
      redis.call('SET', KEYS[1], cjson.encode(rec), 'KEEPTTL')
      return {1, 0}
    `;

    const [code, retryAfter] = await redis.eval(
      lua,
      [tokenKey],
      [emailHash, String(now), String(lockTtl), String(lockExpiresAtMs)]
    );

    if (code === 0) return { ok: false };
    if (code === 2)
      return {
        ok: false,
        alreadyInProgress: true,
        retryAfterSeconds: retryAfter,
      };
    return { ok: true };
  }

  async completeSignupWithVerificationToken(
    verificationTokenHash: string
  ): Promise<void> {
    const redis = getRedis();
    const tokenKey = redisKeys.verificationToken(verificationTokenHash);

    const lua = `
      local raw = redis.call('GET', KEYS[1])
      if not raw then return 0 end
      local rec = cjson.decode(raw)
      rec.status = 'consumed'
      redis.call('SET', KEYS[1], cjson.encode(rec), 'KEEPTTL')
      return 1
    `;
    await redis.eval(lua, [tokenKey], []);
  }

  async releaseSignupVerificationToken(
    verificationTokenHash: string
  ): Promise<void> {
    const redis = getRedis();
    const tokenKey = redisKeys.verificationToken(verificationTokenHash);

    const lua = `
      local raw = redis.call('GET', KEYS[1])
      if not raw then return 0 end
      local rec = cjson.decode(raw)
      if rec.status == 'signup_in_progress' then
        rec.status = 'verified'
        rec.lockExpiresAtMs = nil
        redis.call('SET', KEYS[1], cjson.encode(rec), 'KEEPTTL')
        return 1
      end
      return 0
    `;
    await redis.eval(lua, [tokenKey], []);
  }

  private async _conditionalChallengeStatusUpdate(
    challengeId: string,
    emailHash: string,
    newStatus: ChallengeStatus
  ): Promise<boolean> {
    const redis = getRedis();
    const currentKey = redisKeys.currentChallenge(emailHash);
    const challengeKey = redisKeys.challenge(challengeId);

    const lua = `
      local currentId = redis.call('GET', KEYS[1])
      if currentId ~= ARGV[1] then return 0 end
      local raw = redis.call('GET', KEYS[2])
      if not raw then return 0 end
      local rec = cjson.decode(raw)
      rec.status = ARGV[2]
      redis.call('SET', KEYS[2], cjson.encode(rec), 'KEEPTTL')
      return 1
    `;

    const result = await redis.eval(
      lua,
      [currentKey, challengeKey],
      [challengeId, newStatus]
    );

    return result === 1;
  }
}

let storeInstance: UpstashEmailVerificationStore | null = null;

export function getEmailVerificationStore(): UpstashEmailVerificationStore {
  if (!storeInstance) {
    storeInstance = new UpstashEmailVerificationStore();
  }
  return storeInstance;
}
