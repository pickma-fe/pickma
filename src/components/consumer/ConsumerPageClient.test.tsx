import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Category } from '@/types/category';
import { useCategories } from '@/hooks/categories/useCategories';
import { useUserLocation } from '@/hooks/consumer/useUserLocation';
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

vi.mock('@/hooks/consumer/useUserLocation', () => ({
  useUserLocation: vi.fn(),
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

vi.mock('./LocationPickerButton', () => ({
  LocationPickerButton: () => <div />,
}));

vi.mock('./MapViewFab', () => ({
  MapViewFab: () => <div />,
}));

vi.mock('./NoLocationView', () => ({
  NoLocationView: () => <div data-testid="no-location-view" />,
}));

vi.mock('./ProductFilterSidebar', () => ({
  ProductFilterSidebar: () => <aside />,
}));

vi.mock('./PromotionCarousel', () => ({
  PromotionCarousel: () => <section />,
}));

vi.mock('./SearchRadiusSelector', () => ({
  SearchRadiusSelector: ({
    radiusKm,
    onRadiusChange,
  }: {
    radiusKm: number;
    onRadiusChange: (radiusKm: number) => void;
  }) => (
    <button type="button" onClick={() => onRadiusChange(5)}>
      반경 {radiusKm}
    </button>
  ),
}));

const mockCategory: Category = {
  id: '00000000-0000-4000-8000-000000000011',
  name: '베이커리',
  icon: 'bread',
  sortOrder: 1,
};

describe('ConsumerPageClient', () => {
  beforeEach(() => {
    vi.mocked(useCategories).mockReset();
    vi.mocked(useProducts).mockReset();
    vi.mocked(useUserLocation).mockReset();
    vi.mocked(useCategories).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useCategories>);
    vi.mocked(useProducts).mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProducts>);
    vi.mocked(useUserLocation).mockReturnValue({
      location: null,
      saveLocation: vi.fn(),
      clearLocation: vi.fn(),
    });
  });

  it('위치 미설정 시 useProducts를 비활성화한다', () => {
    render(<ConsumerPageClient />);

    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10 }),
      { enabled: false }
    );
  });

  it('위치 설정 시 useProducts에 위치 파라미터를 전달한다', () => {
    vi.mocked(useUserLocation).mockReturnValue({
      location: {
        lat: 37.5665,
        lng: 126.978,
        address: '서울시 중구',
        savedAt: 0,
      },
      saveLocation: vi.fn(),
      clearLocation: vi.fn(),
    });

    render(<ConsumerPageClient />);

    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        userLat: 37.5665,
        userLng: 126.978,
        radiusKm: 3,
        page: 1,
        pageSize: 10,
      }),
      { enabled: true }
    );
  });

  it('반경 변경 시 useProducts에 새 radiusKm를 전달한다', () => {
    vi.mocked(useUserLocation).mockReturnValue({
      location: {
        lat: 37.5665,
        lng: 126.978,
        address: '서울시 중구',
        savedAt: 0,
      },
      saveLocation: vi.fn(),
      clearLocation: vi.fn(),
    });

    render(<ConsumerPageClient />);
    fireEvent.click(screen.getByRole('button', { name: '반경 3' }));

    expect(useProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        radiusKm: 5,
      }),
      { enabled: true }
    );
  });

  it('초기 카테고리 데이터를 useCategories에 전달한다', () => {
    render(<ConsumerPageClient initialCategories={[mockCategory]} />);

    expect(useCategories).toHaveBeenCalledWith({
      initialData: [mockCategory],
    });
  });
});
