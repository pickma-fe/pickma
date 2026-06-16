import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SORT_OPTION_ID,
  normalizeSortOptionId,
} from './consumerProductFilters';

describe('normalizeSortOptionId', () => {
  it('기본 정렬 옵션은 추천순이다', () => {
    expect(DEFAULT_SORT_OPTION_ID).toBe('ai-recommendation');
  });

  it('지원하는 정렬 옵션을 그대로 반환한다', () => {
    expect(normalizeSortOptionId('deadline')).toBe('deadline');
    expect(normalizeSortOptionId('discount-rate')).toBe('discount-rate');
    expect(normalizeSortOptionId('price-low')).toBe('price-low');
    expect(normalizeSortOptionId('distance')).toBe('distance');
    expect(normalizeSortOptionId('ai-recommendation')).toBe(
      'ai-recommendation'
    );
  });

  it('지원하지 않는 정렬 옵션이면 기본값으로 정규화한다', () => {
    expect(normalizeSortOptionId('latest')).toBe(DEFAULT_SORT_OPTION_ID);
  });
});
