import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildMockProductListResponse } from './productList';

describe('buildMockProductListResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T03:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('region, category, keyword, discountOption, sort 조건을 반영한다', () => {
    const result = buildMockProductListResponse({
      page: 1,
      pageSize: 10,
      region: '서울 강남구',
      categoryId: '00000000-0000-4000-8000-000000000011',
      keyword: '티라미수',
      discountOption: 'over-40',
      sort: 'discountRate',
      order: 'desc',
      availableOnly: true,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('티라미수 컵케이크');
    expect(result.items[0].discountRate).toBeGreaterThanOrEqual(40);
  });

  it('페이지네이션을 적용한다', () => {
    const result = buildMockProductListResponse({
      page: 2,
      pageSize: 3,
      availableOnly: true,
      sort: 'endAt',
      order: 'asc',
    });

    expect(result.items).toHaveLength(3);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(3);
    expect(result.totalPages).toBeGreaterThan(1);
  });
});
