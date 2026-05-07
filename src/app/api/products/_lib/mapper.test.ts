import { describe, expect, it } from 'vitest';

import { mapProductDetailRow, mapProductRow } from './mapper';
import type { ProductRow } from './mapper';

const baseRow: ProductRow = {
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
    description: '당일 생산 후 남은 크루아상과 페이스트리를 담은 세트입니다.',
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
    description: '매일 아침 굽는 동네 베이커리입니다.',
    phone: '02-1234-5678',
    address: '서울시 마포구 월드컵북로 12',
    address_detail: '1층',
    region: '서울 마포구',
    image: null,
  },
};

describe('mapProductRow', () => {
  it('availableStock을 계산한다', () => {
    expect(mapProductRow(baseRow).availableStock).toBe(6);
  });

  it('discountRate를 계산한다', () => {
    expect(mapProductRow(baseRow).discountRate).toBe(40);
    expect(
      mapProductRow({
        ...baseRow,
        discount_price: 9000,
        menu_items: { ...baseRow.menu_items, original_price: 12000 },
      }).discountRate
    ).toBe(25);
  });

  it('isSoldOut을 계산한다', () => {
    expect(
      mapProductRow({ ...baseRow, stock: 2, reserved_stock: 2 }).isSoldOut
    ).toBe(true);
    expect(
      mapProductRow({ ...baseRow, stock: 3, reserved_stock: 2 }).isSoldOut
    ).toBe(false);
  });

  it('isExpired를 계산한다', () => {
    expect(
      mapProductRow({ ...baseRow, end_at: '2020-01-01T00:00:00.000Z' })
        .isExpired
    ).toBe(true);
    expect(mapProductRow(baseRow).isExpired).toBe(false);
  });

  it('displayStatus 우선순위: closed > expired > soldOut > available', () => {
    const expiredSoldOut = {
      ...baseRow,
      end_at: '2020-01-01T00:00:00.000Z',
      stock: 2,
      reserved_stock: 2,
    };

    expect(
      mapProductRow({ ...expiredSoldOut, status: 'closed' }).displayStatus
    ).toBe('closed');
    expect(mapProductRow(expiredSoldOut).displayStatus).toBe('expired');
    expect(
      mapProductRow({ ...baseRow, stock: 2, reserved_stock: 2 }).displayStatus
    ).toBe('soldOut');
    expect(mapProductRow(baseRow).displayStatus).toBe('available');
  });

  it('updated_at → updatedAt 매핑', () => {
    expect(mapProductRow(baseRow).updatedAt).toBe('2026-05-07T09:00:00.000Z');
  });

  it('categories가 null이면 categoryId/categoryName을 undefined로 반환한다', () => {
    const result = mapProductRow({ ...baseRow, categories: null });
    expect(result.categoryId).toBeUndefined();
    expect(result.categoryName).toBeUndefined();
  });

  it('menu_items.image가 null이면 image를 undefined로 반환한다', () => {
    expect(mapProductRow(baseRow).image).toBeUndefined();
    expect(
      mapProductRow({
        ...baseRow,
        menu_items: { ...baseRow.menu_items, image: '/img/test.jpg' },
      }).image
    ).toBe('/img/test.jpg');
  });
});

describe('mapProductDetailRow', () => {
  it('store 필드를 포함한다', () => {
    const result = mapProductDetailRow(baseRow);
    expect(result.store.id).toBe('00000000-0000-4000-8000-000000000031');
    expect(result.store.phone).toBe('02-1234-5678');
    expect(result.store.address).toBe('서울시 마포구 월드컵북로 12');
    expect(result.store.addressDetail).toBe('1층');
    expect(result.store.region).toBe('서울 마포구');
  });

  it('menu_items.description을 description 필드로 매핑한다', () => {
    expect(mapProductDetailRow(baseRow).description).toBe(
      '당일 생산 후 남은 크루아상과 페이스트리를 담은 세트입니다.'
    );
    expect(
      mapProductDetailRow({
        ...baseRow,
        menu_items: { ...baseRow.menu_items, description: null },
      }).description
    ).toBeUndefined();
  });

  it('store.description이 null이면 undefined로 반환한다', () => {
    const result = mapProductDetailRow({
      ...baseRow,
      stores: { ...baseRow.stores, description: null },
    });
    expect(result.store.description).toBeUndefined();
  });
});
