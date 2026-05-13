import { describe, expect, it } from 'vitest';

import { mapSellerProductRow, type SellerProductRow } from './mapper';

const baseRow: SellerProductRow = {
  id: '00000000-0000-4000-8000-000000000051',
  store_id: '00000000-0000-4000-8000-000000000031',
  menu_item_id: '00000000-0000-4000-8000-000000000041',
  category_id: '00000000-0000-4000-8000-000000000011',
  discount_price: 7200,
  stock: 8,
  reserved_stock: 2,
  end_at: '2099-12-31T23:59:59.000Z',
  pickup_start_time: '10:00:00',
  pickup_end_time: '13:30:00',
  status: 'active',
  updated_at: '2026-05-07T09:00:00.000Z',
  menu_items: {
    id: '00000000-0000-4000-8000-000000000041',
    name: '마감 할인 크루아상 세트',
    image: null,
    original_price: 12000,
  },
  categories: {
    id: '00000000-0000-4000-8000-000000000011',
    name: '베이커리',
  },
  stores: {
    id: '00000000-0000-4000-8000-000000000031',
    name: '픽마 베이커리',
  },
};

describe('mapSellerProductRow', () => {
  it('seller product row를 ProductListItemResponse로 매핑한다', () => {
    const result = mapSellerProductRow(baseRow);

    expect(result).toMatchObject({
      id: baseRow.id,
      storeId: baseRow.store_id,
      storeName: '픽마 베이커리',
      menuItemId: baseRow.menu_items.id,
      name: '마감 할인 크루아상 세트',
      originalPrice: 12000,
      discountPrice: 7200,
      discountRate: 40,
      stock: 8,
      reservedStock: 2,
      availableStock: 6,
      pickupStartTime: '10:00:00',
      pickupEndTime: '13:30:00',
      status: 'active',
      updatedAt: '2026-05-07T09:00:00.000Z',
    });
  });

  it('category와 image가 null이면 undefined로 반환한다', () => {
    const result = mapSellerProductRow({
      ...baseRow,
      categories: null,
      menu_items: { ...baseRow.menu_items, image: null },
    });

    expect(result.categoryId).toBeUndefined();
    expect(result.categoryName).toBeUndefined();
    expect(result.image).toBeUndefined();
  });

  it('displayStatus 우선순위를 계산한다', () => {
    expect(
      mapSellerProductRow({ ...baseRow, status: 'closed' }).displayStatus
    ).toBe('closed');
    expect(
      mapSellerProductRow({
        ...baseRow,
        end_at: '2020-01-01T00:00:00.000Z',
      }).displayStatus
    ).toBe('expired');
    expect(
      mapSellerProductRow({ ...baseRow, stock: 2, reserved_stock: 2 })
        .displayStatus
    ).toBe('soldOut');
  });
});
