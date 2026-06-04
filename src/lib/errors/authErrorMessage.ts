import type { ErrorCode } from './errorCodes';
import { ERROR_MESSAGES } from './errorMessages';

function hasCode(error: unknown): error is { code: string } {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

function hasStatus(error: unknown): error is { status: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as Record<string, unknown>).status === 'number'
  );
}

export function getAuthErrorMessage(error: unknown): string {
  if (hasCode(error)) {
    const message = ERROR_MESSAGES[error.code as ErrorCode];
    if (message) return message;
  }

  if (hasStatus(error) && error.status === 429) {
    return '요청 횟수가 너무 많습니다. 잠시 후 다시 시도해 주세요.';
  }

  const msg = error instanceof Error ? error.message.toLowerCase() : '';

  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid email or password')
  ) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (
    msg.includes('user already registered') ||
    msg.includes('already been registered')
  ) {
    return '이미 가입된 이메일입니다. 로그인해 주세요.';
  }
  if (msg.includes('email not confirmed')) {
    return '이메일 확인 후 다시 로그인해 주세요.';
  }
  if (
    msg.includes('password should be at least') ||
    msg.includes('weak password')
  ) {
    return '비밀번호는 10자 이상으로 입력해 주세요.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return '요청 횟수가 너무 많습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (msg.includes('same password') || msg.includes('different from the old')) {
    return '현재 사용 중인 비밀번호와 다른 비밀번호를 입력해 주세요.';
  }
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}
