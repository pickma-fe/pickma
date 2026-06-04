import { describe, expect, it } from 'vitest';

import { getAuthErrorMessage } from './authErrorMessage';

function makeApiError(code: string, message = 'error'): Error {
  const error = new Error(message);
  (error as Error & { code: string }).code = code;
  return error;
}

describe('getAuthErrorMessage', () => {
  describe('ApiError code 매핑', () => {
    it('AUTH_EMAIL_ALREADY_EXISTS', () => {
      expect(
        getAuthErrorMessage(makeApiError('AUTH_EMAIL_ALREADY_EXISTS'))
      ).toBe('이미 가입된 이메일입니다. 로그인해 주세요.');
    });

    it('AUTH_EMAIL_OTP_EXPIRED', () => {
      expect(getAuthErrorMessage(makeApiError('AUTH_EMAIL_OTP_EXPIRED'))).toBe(
        '인증 코드가 만료되었습니다. 다시 요청해 주세요.'
      );
    });

    it('AUTH_EMAIL_OTP_INVALID', () => {
      expect(getAuthErrorMessage(makeApiError('AUTH_EMAIL_OTP_INVALID'))).toBe(
        '인증 코드가 올바르지 않습니다.'
      );
    });

    it('AUTH_EMAIL_OTP_ATTEMPT_LIMIT_EXCEEDED', () => {
      expect(
        getAuthErrorMessage(
          makeApiError('AUTH_EMAIL_OTP_ATTEMPT_LIMIT_EXCEEDED')
        )
      ).toBe('인증 시도 횟수를 초과했습니다. 다시 요청해 주세요.');
    });

    it('RATE_LIMIT_EXCEEDED', () => {
      expect(getAuthErrorMessage(makeApiError('RATE_LIMIT_EXCEEDED'))).toBe(
        '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
      );
    });

    it('AUTH_EMAIL_VERIFICATION_TOKEN_EXPIRED', () => {
      expect(
        getAuthErrorMessage(
          makeApiError('AUTH_EMAIL_VERIFICATION_TOKEN_EXPIRED')
        )
      ).toBe('이메일 인증이 만료되었습니다. 다시 인증해 주세요.');
    });

    it('AUTH_EMAIL_VERIFICATION_TOKEN_INVALID', () => {
      expect(
        getAuthErrorMessage(
          makeApiError('AUTH_EMAIL_VERIFICATION_TOKEN_INVALID')
        )
      ).toBe('이메일 인증이 유효하지 않습니다. 다시 인증해 주세요.');
    });

    it('AUTH_EMAIL_SEND_FAILED', () => {
      expect(getAuthErrorMessage(makeApiError('AUTH_EMAIL_SEND_FAILED'))).toBe(
        '인증 메일을 발송하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
    });

    it('INTERNAL_SERVER_ERROR', () => {
      expect(getAuthErrorMessage(makeApiError('INTERNAL_SERVER_ERROR'))).toBe(
        '서버 오류가 발생했습니다.'
      );
    });

    it('알 수 없는 code: 기본 메시지 반환', () => {
      expect(getAuthErrorMessage(makeApiError('UNKNOWN_CODE'))).toBe(
        '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
    });
  });

  describe('Supabase 에러 메시지 매핑', () => {
    it('invalid login credentials', () => {
      expect(getAuthErrorMessage(new Error('Invalid login credentials'))).toBe(
        '이메일 또는 비밀번호가 올바르지 않습니다.'
      );
    });

    it('user already registered', () => {
      expect(getAuthErrorMessage(new Error('User already registered'))).toBe(
        '이미 가입된 이메일입니다. 로그인해 주세요.'
      );
    });

    it('email not confirmed', () => {
      expect(getAuthErrorMessage(new Error('Email not confirmed'))).toBe(
        '이메일 확인 후 다시 로그인해 주세요.'
      );
    });

    it('password should be at least', () => {
      expect(
        getAuthErrorMessage(
          new Error('Password should be at least 6 characters')
        )
      ).toBe('비밀번호는 10자 이상으로 입력해 주세요.');
    });

    it('rate limit: status 429', () => {
      const error = Object.assign(new Error('Too many requests'), {
        status: 429,
      });
      expect(getAuthErrorMessage(error)).toBe(
        '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
      );
    });

    it('rate limit: message "too many requests"', () => {
      expect(getAuthErrorMessage(new Error('Too many requests'))).toBe(
        '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
      );
    });

    it('동일 비밀번호: "New password should be different from the old password"', () => {
      expect(
        getAuthErrorMessage(
          new Error('New password should be different from the old password')
        )
      ).toBe('현재 사용 중인 비밀번호와 다른 비밀번호를 입력해 주세요.');
    });
  });

  describe('기본 메시지', () => {
    it('Error가 아닌 값', () => {
      expect(getAuthErrorMessage(null)).toBe(
        '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
    });

    it('알 수 없는 에러 메시지', () => {
      expect(getAuthErrorMessage(new Error('something unexpected'))).toBe(
        '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
    });
  });
});
