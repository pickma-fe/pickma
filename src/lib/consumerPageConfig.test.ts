import { describe, expect, it } from 'vitest';

import { getProductSortQuery } from './consumerPageConfig';

describe('getProductSortQuery', () => {
  it('AI 추천 정렬을 aiRecommendation query로 변환한다', () => {
    expect(getProductSortQuery('ai-recommendation')).toEqual({
      sort: 'aiRecommendation',
    });
  });

  it('거리순 정렬을 distance query로 변환한다', () => {
    expect(getProductSortQuery('distance')).toEqual({
      sort: 'distance',
    });
  });

  it('기본 정렬은 마감 임박순 query로 변환한다', () => {
    expect(getProductSortQuery('deadline')).toEqual({
      sort: 'endAt',
      order: 'asc',
    });
  });
});
