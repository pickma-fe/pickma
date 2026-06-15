import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserLocation } from '@/hooks/consumer/useUserLocation';
import { useProducts } from '@/hooks/products/useProducts';

import { MapPageClient } from './MapPageClient';

vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="store-map-view" />,
}));

vi.mock('@/hooks/consumer/useUserLocation', () => ({
  useUserLocation: vi.fn(),
}));

vi.mock('@/hooks/products/useProducts', () => ({
  useProducts: vi.fn(),
}));

vi.mock('./ConsumerMapHeader', () => ({
  ConsumerMapHeader: () => <header />,
}));

vi.mock('./NoLocationView', () => ({
  NoLocationView: () => <div data-testid="no-location-view" />,
}));

vi.mock('./SearchRadiusSelector', () => ({
  SearchRadiusSelector: ({ radiusKm }: { radiusKm: number }) => (
    <button type="button">반경 {radiusKm}</button>
  ),
}));

describe('MapPageClient', () => {
  beforeEach(() => {
    vi.mocked(useUserLocation).mockReset();
    vi.mocked(useProducts).mockReset();
    vi.mocked(useProducts).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useProducts>);
    vi.mocked(useUserLocation).mockReturnValue({
      location: null,
      saveLocation: vi.fn(),
      clearLocation: vi.fn(),
    });
  });

  it('위치가 없으면 반경 UI를 노출하지 않는다', () => {
    render(<MapPageClient />);

    expect(screen.queryByRole('button', { name: '반경 3' })).toBeNull();
  });

  it('위치가 있으면 반경 UI를 노출한다', () => {
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

    render(<MapPageClient />);

    expect(screen.getByRole('button', { name: '반경 3' })).toBeInTheDocument();
  });
});
