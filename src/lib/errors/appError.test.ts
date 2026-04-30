import { describe, expect, it } from 'vitest';

import { AppError } from './appError';
import { ERROR_CODE } from './errorCodes';

describe('AppError', () => {
  it('에러 코드의 기본 메시지와 상태 코드를 가진다', () => {
    const error = new AppError(ERROR_CODE.NOT_IMPLEMENTED, 501);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AppError');
    expect(error.code).toBe('NOT_IMPLEMENTED');
    expect(error.statusCode).toBe(501);
    expect(error.message).toBe('아직 구현되지 않은 API입니다.');
  });

  it('검증 상세 정보를 보존한다', () => {
    const error = new AppError(ERROR_CODE.VALIDATION_ERROR, 400, undefined, [
      { path: 'productId', message: '필수 값입니다.' },
    ]);

    expect(error.details).toEqual([
      { path: 'productId', message: '필수 값입니다.' },
    ]);
  });
});
