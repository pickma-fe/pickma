import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { AppError } from '@/lib/errors/appError';

import { validateQuery } from './validation';

describe('validateQuery', () => {
  it('Zod 검증에 성공하면 변환된 값을 반환한다', () => {
    const schema = z.object({
      page: z.coerce.number().int().positive(),
    });

    expect(validateQuery(schema, new URLSearchParams('page=2'))).toEqual({
      page: 2,
    });
  });

  it('Zod 검증 실패를 VALIDATION_ERROR로 변환한다', () => {
    const schema = z.object({
      page: z.coerce.number().int().positive(),
    });

    expect(() => validateQuery(schema, new URLSearchParams('page=0'))).toThrow(
      AppError
    );

    try {
      validateQuery(schema, new URLSearchParams('page=0'));
    } catch (error) {
      expect(error).toMatchObject({
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: [{ path: 'page' }],
      });
    }
  });
});
