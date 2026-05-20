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

  it('categoryId 파라미터를 허용한다', () => {
    const result = productListSchema.safeParse({ categoryId: 'abc' });
    expect(result.success).toBe(true);
    expect(result.data?.categoryId).toBe('abc');
  });

  it('keyword 파라미터를 허용한다', () => {
    const result = productListSchema.safeParse({ keyword: '크루아상' });
    expect(result.success).toBe(true);
    expect(result.data?.keyword).toBe('크루아상');
  });

  it('keyword가 공백만 있으면 validation error를 반환한다', () => {
    expect(productListSchema.safeParse({ keyword: '   ' }).success).toBe(false);
  });

  it('정렬/할인 파라미터를 허용한다', () => {
    const result = productListSchema.safeParse({
      sort: 'discountPrice',
      order: 'asc',
      discountOption: 'over-40',
      availableOnly: 'true',
    });
    expect(result.success).toBe(true);
    expect(result.data?.sort).toBe('discountPrice');
    expect(result.data?.order).toBe('asc');
    expect(result.data?.discountOption).toBe('over-40');
    expect(result.data?.availableOnly).toBe(true);
  });

  it('availableOnly=false 문자열을 false로 변환한다', () => {
    const result = productListSchema.safeParse({ availableOnly: 'false' });
    expect(result.success).toBe(true);
    expect(result.data?.availableOnly).toBe(false);
  });

  it('지원하지 않는 정렬 파라미터 전달 시 validation error를 반환한다', () => {
    expect(productListSchema.safeParse({ sort: 'deadline' }).success).toBe(
      false
    );
    expect(productListSchema.safeParse({ order: 'latest' }).success).toBe(
      false
    );
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
