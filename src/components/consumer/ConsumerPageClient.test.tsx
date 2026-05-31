import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Category } from '@/types/category';
import type { PaginatedResult } from '@/types/common';
import type { Product } from '@/types/product';
import { useCategories } from '@/hooks/categories/useCategories';
import { useProducts } from '@/hooks/products/useProducts';

import { ConsumerPageClient } from './ConsumerPageClient';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/hooks/categories/useCategories', () => ({
  useCategories: vi.fn(),
}));

vi.mock('@/hooks/products/useProducts', () => ({
  useProducts: vi.fn(),
}));

vi.mock('@/components/common', () => ({
  Button: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
  Footer: () => <footer />,
}));

vi.mock('./ConsumerHeader', () => ({
  ConsumerHeader: () => <header />,
}));

vi.mock('./ConsumerHeaderSearch', () => ({
  ConsumerHeaderSearch: () => <div />,
}));

vi.mock('./ConsumerProductList', () => ({
  ConsumerProductList: () => <div />,
}));

vi.mock('./ProductFilterSidebar', () => ({
  ProductFilterSidebar: () => <aside />,
}));

vi.mock('./PromotionCarousel', () => ({
  PromotionCarousel: () => <section />,
}));

const mockCategory: Category = {
  id: '00000000-0000-4000-8000-000000000011',
  name: '베이커리',
  icon: 'bread',
  sortOrder: 1,
};

const mockProduct: Product = {
  id: '00000000-0000-4000-8000-000000000051',
  storeId: '00000000-0000-4000-8000-000000000031',
  storeName: '픽마 베이커리',
  menuItemId: '00000000-0000-4000-8000-000000000041',
  name: '마감 할인 크루아상 세트',
  originalPrice: 12000,
  discountPrice: 7200,
  discountRate: 40,
  stock: 8,
  reservedStock: 2,
  availableStock: 6,
  endAt: new Date('2099-12-31T23:59:59.000Z'),
  pickupStartTime: '10:00:00',
  pickupEndTime: '13:30:00',
  status: 'active',
  isSoldOut: false,
  isExpired: false,
  displayStatus: 'available',
  updatedAt: new Date('2026-05-07T09:00:00.000Z'),
};

const mockProductList: PaginatedResult<Product> = {
  items: [mockProduct],
  page: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
};

describe('ConsumerPageClient', () => {
  beforeEach(() => {
    vi.mocked(useCategories).mockReset();
    vi.mocked(useProducts).mockReset();
    vi.mocked(useCategories).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useCategories>);
    vi.mocked(useProducts).mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: false,
      isLoading: true,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProducts>);
  });

  it('초기 데이터가 없으면 hook에 initialData를 넘기지 않는다', () => {
    render(<ConsumerPageClient />);

    expect(useCategories).toHaveBeenCalledWith({
      initialData: undefined,
    });
    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10 }),
      { initialData: undefined }
    );
  });

  it('초기 데이터가 있으면 hook initialData로 전달한다', () => {
    render(
      <ConsumerPageClient
        initialCategories={[mockCategory]}
        initialProducts={mockProductList}
      />
    );

    expect(useCategories).toHaveBeenCalledWith({
      initialData: [mockCategory],
    });
    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10 }),
      { initialData: mockProductList }
    );
  });
});
