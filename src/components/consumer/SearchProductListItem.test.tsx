import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Product } from '@/types/product';

import { SearchProductListItem } from './SearchProductListItem';

vi.mock('next/image', () => ({
  default: ({
    fill,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ''} data-fill={fill ? 'true' : 'false'} {...props} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseProduct: Product = {
  id: 'product-1',
  storeId: 'store-1',
  storeName: '픽마 베이커리',
  menuItemId: 'menu-1',
  name: '크루아상 세트',
  originalPrice: 12000,
  discountPrice: 7200,
  discountRate: 40,
  stock: 5,
  reservedStock: 1,
  availableStock: 4,
  endAt: new Date('2099-12-31T23:59:59.000Z'),
  pickupStartTime: '10:00:00',
  pickupEndTime: '12:00:00',
  status: 'active',
  isSoldOut: false,
  isExpired: false,
  displayStatus: 'available',
  updatedAt: new Date('2026-06-12T00:00:00.000Z'),
};

describe('SearchProductListItem', () => {
  it('distanceKm이 있으면 거리 정보를 표시한다', () => {
    render(
      <SearchProductListItem product={{ ...baseProduct, distanceKm: 0.6 }} />
    );

    expect(screen.getByText('0.6km')).toBeInTheDocument();
  });

  it('distanceKm이 없으면 거리 정보를 숨긴다', () => {
    render(<SearchProductListItem product={baseProduct} />);

    expect(screen.queryByText(/km$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/m$/)).not.toBeInTheDocument();
  });
});
