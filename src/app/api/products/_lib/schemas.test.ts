import { describe, expect, it } from 'vitest';

import { productIdSchema, productListSchema } from './schemas';

describe('productListSchema', () => {
  it('문자열 page/pageSize를 숫자로 변환한다', () => {
    const result = productListSchema.safeParse({ page: '2', pageSize: '10' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ page: 2, pageSize: 10 });
  });

  it('파라미터 없을 때 기본값을 적용한다', () => {
    const result = productListSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ page: 1, pageSize: 20 });
  });

  it('region 필터를 허용한다', () => {
    const result = productListSchema.safeParse({ region: '서울 마포구' });
    expect(result.success).toBe(true);
    expect(result.data?.region).toBe('서울 마포구');
  });

  it('P1 파라미터 전달 시 validation error를 반환한다', () => {
    expect(productListSchema.safeParse({ categoryId: 'abc' }).success).toBe(
      false
    );
    expect(productListSchema.safeParse({ keyword: 'coffee' }).success).toBe(
      false
    );
  });

  it('P2 파라미터 전달 시 validation error를 반환한다', () => {
    expect(productListSchema.safeParse({ sort: 'endAt' }).success).toBe(false);
    expect(productListSchema.safeParse({ order: 'asc' }).success).toBe(false);
  });

  it('page가 0 이하이면 validation error를 반환한다', () => {
    expect(productListSchema.safeParse({ page: '0' }).success).toBe(false);
    expect(productListSchema.safeParse({ page: '-1' }).success).toBe(false);
  });

  it('pageSize가 100을 초과하면 validation error를 반환한다', () => {
    expect(productListSchema.safeParse({ pageSize: '101' }).success).toBe(
      false
    );
  });
});

describe('productIdSchema', () => {
  it('유효한 UUID를 허용한다', () => {
    expect(
      productIdSchema.safeParse('00000000-0000-4000-8000-000000000051').success
    ).toBe(true);
  });

  it('UUID가 아닌 값을 거부한다', () => {
    expect(productIdSchema.safeParse('not-a-uuid').success).toBe(false);
    expect(productIdSchema.safeParse('product_1').success).toBe(false);
    expect(productIdSchema.safeParse('').success).toBe(false);
  });
});
