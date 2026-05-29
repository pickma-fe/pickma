export type ChallengeStatus =
  | 'pending'
  | 'sent'
  | 'send_failed'
  | 'superseded'
  | 'verified'
  | 'signup_in_progress'
  | 'consumed';

export type VerificationTokenStatus =
  | 'verified'
  | 'signup_in_progress'
  | 'consumed';

export interface RequestLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  emailCount: number;
  ipCount: number;
}

export interface IssueChallengeInput {
  challengeId: string;
  emailHash: string;
  otpHash: string;
  expiresAt: Date;
}

export interface Challenge {
  challengeId: string;
  emailHash: string;
  otpHash: string;
  status: ChallengeStatus;
  expiresAt: Date;
  createdAt: Date;
}

export interface MarkVerifiedInput {
  challengeId: string;
  emailHash: string;
  verificationTokenHash: string;
  tokenExpiresAt: Date;
}

export interface BeginSignupResult {
  ok: boolean;
  alreadyInProgress?: boolean;
  retryAfterSeconds?: number;
}

export interface EmailVerificationStore {
  /**
   * OTP 발송 요청 rate limit 확인 및 count 증가.
   * count 증가, TTL 설정, limit 판단을 하나의 저장소 동작으로 처리한다.
   */
  checkAndIncrementRequestLimit(
    emailHash: string,
    ipHash: string
  ): Promise<RequestLimitResult>;

  /**
   * 새 OTP challenge를 active 상태로 발급한다.
   * 같은 emailHash의 기존 active challenge는 더 이상 검증될 수 없도록 보장한다.
   */
  issueChallenge(input: IssueChallengeInput): Promise<void>;

  /**
   * emailHash의 current active challenge를 조회한다.
   */
  getActiveChallenge(emailHash: string): Promise<Challenge | null>;

  /**
   * OTP 검증 attempt count를 증가시킨다.
   */
  incrementAttempt(challengeId: string): Promise<number>;

  /**
   * challenge가 여전히 emailHash의 active challenge일 때만 status를 'sent'로 변경한다.
   */
  markChallengeSent(challengeId: string, emailHash: string): Promise<boolean>;

  /**
   * challenge가 여전히 emailHash의 active challenge일 때만 status를 'send_failed'로 변경한다.
   */
  markChallengeSendFailed(
    challengeId: string,
    emailHash: string
  ): Promise<boolean>;

  /**
   * challenge가 emailHash의 active challenge일 때만 status를 'verified'로 변경하고
   * verification token key를 저장한다. challenge TTL을 token TTL 이상으로 연장한다.
   */
  markVerified(input: MarkVerifiedInput): Promise<boolean>;

  /**
   * verification token 검증과 verified → signup_in_progress 전환을 원자적으로 처리한다.
   * 이미 signup_in_progress이면 retryAfterSeconds를 포함한 결과를 반환한다.
   */
  beginSignupWithVerificationToken(
    verificationTokenHash: string,
    emailHash: string
  ): Promise<BeginSignupResult>;

  /**
   * 최종 가입 성공 후 token status를 'consumed'로 변경한다.
   */
  completeSignupWithVerificationToken(
    verificationTokenHash: string
  ): Promise<void>;

  /**
   * 재시도 가능한 실패에서 token status를 'verified'로 되돌린다.
   */
  releaseSignupVerificationToken(verificationTokenHash: string): Promise<void>;
}
