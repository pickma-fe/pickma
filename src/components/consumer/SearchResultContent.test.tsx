import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SearchResultContent } from './SearchResultContent';

vi.mock('./NoLocationView', () => ({
  NoLocationView: () => <div data-testid="no-location-view" />,
}));

const baseProps = {
  onLocationChange: vi.fn(),
  hasKeyword: true,
  isLoading: false,
  isError: false,
  isFetching: false,
  products: [],
  totalPages: 0,
  currentPage: 1,
  viewMode: 'grid' as const,
  onRetry: vi.fn(),
  onPageChange: vi.fn(),
};

describe('SearchResultContent', () => {
  it('위치가 없으면 다른 상태와 무관하게 NoLocationView를 우선 노출한다', () => {
    render(
      <SearchResultContent
        {...baseProps}
        hasLocation={false}
        hasKeyword={true}
        isLoading={true}
        isError={true}
      />
    );

    expect(screen.getByTestId('no-location-view')).toBeInTheDocument();
    expect(
      screen.queryByText('검색 결과를 불러오는 중입니다.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('검색 결과를 불러오지 못했습니다.')
    ).not.toBeInTheDocument();
  });

  it('위치가 있으면 키워드 없음 안내를 노출한다', () => {
    render(
      <SearchResultContent
        {...baseProps}
        hasLocation={true}
        hasKeyword={false}
      />
    );

    expect(screen.queryByTestId('no-location-view')).not.toBeInTheDocument();
    expect(
      screen.getByText('검색어를 입력하면 마감 할인 상품을 찾아드릴게요.')
    ).toBeInTheDocument();
  });
});
