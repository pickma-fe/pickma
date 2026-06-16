import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { addRecentProduct } from '@/lib/recentProducts';

import { RecentProductTracker } from './RecentProductTracker';

vi.mock('@/lib/recentProducts', () => ({
  addRecentProduct: vi.fn(),
}));

describe('RecentProductTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('상품 상세 진입 시 recent product를 저장하고 조회 이력 API를 호출한다', async () => {
    render(
      <RecentProductTracker
        id="product-1"
        name="마감 할인 크루아상"
        imageUrl="https://example.com/product.png"
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/products/product-1/view', {
        method: 'POST',
        credentials: 'same-origin',
        keepalive: true,
      });
    });

    expect(addRecentProduct).toHaveBeenCalledWith({
      id: 'product-1',
      name: '마감 할인 크루아상',
      imageUrl: 'https://example.com/product.png',
    });
  });
});
