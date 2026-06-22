import { describe, expect, it } from 'vitest';

import {
  getHomeProductsPageSizeForWidth,
  getProductSortQuery,
} from './consumerPageConfig';

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

describe('getHomeProductsPageSizeForWidth', () => {
  it('상품 grid 열 수에 맞춰 홈 pageSize를 반환한다', () => {
    expect(getHomeProductsPageSizeForWidth(375)).toBe(6);
    expect(getHomeProductsPageSizeForWidth(768)).toBe(8);
    expect(getHomeProductsPageSizeForWidth(1024)).toBe(9);
    expect(getHomeProductsPageSizeForWidth(1440)).toBe(12);
    expect(getHomeProductsPageSizeForWidth(1536)).toBe(15);
  });
});
