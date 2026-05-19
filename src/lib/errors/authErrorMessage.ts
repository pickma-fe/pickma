export function getAuthErrorMessage(error: unknown): string {
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
    return '비밀번호는 8자 이상으로 입력해 주세요.';
  }
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}
