import { describe, expect, it } from 'vitest';

import type { Database } from '@/lib/supabase/database';

import { mapStoreRow } from './mapper';

type StoresRow = Database['public']['Tables']['stores']['Row'];

const baseRow: StoresRow = {
  id: 'store-1',
  user_id: 'user-1',
  name: '픽마 베이커리',
  description: null,
  business_number: '123-45-67890',
  phone: '02-1234-5678',
  address: '서울시 마포구 월드컵북로 12',
  address_detail: null,
  region: '서울 마포구',
  image: null,
  open_time: null,
  close_time: null,
  status: 'active' as const,
  operation_status: 'open' as const,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('mapStoreRow', () => {
  it('DB row를 StoreResponse DTO로 변환한다', () => {
    expect(mapStoreRow(baseRow, false)).toEqual({
      id: 'store-1',
      userId: 'user-1',
      name: '픽마 베이커리',
      description: undefined,
      businessNumber: '123-45-67890',
      phone: '02-1234-5678',
      address: '서울시 마포구 월드컵북로 12',
      addressDetail: undefined,
      region: '서울 마포구',
      image: undefined,
      openTime: undefined,
      closeTime: undefined,
      status: 'active',
      operationStatus: 'open',
      canSell: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
  });

  it('null 필드를 undefined로 변환한다', () => {
    const result = mapStoreRow(baseRow, false);
    expect(result.description).toBeUndefined();
    expect(result.addressDetail).toBeUndefined();
    expect(result.image).toBeUndefined();
    expect(result.openTime).toBeUndefined();
    expect(result.closeTime).toBeUndefined();
  });

  it('null이 아닌 선택 필드는 그대로 반환한다', () => {
    const result = mapStoreRow(
      {
        ...baseRow,
        description: '매일 아침 굽는 동네 베이커리입니다.',
        address_detail: '1층',
        image: 'https://example.com/store.jpg',
        open_time: '09:00:00',
        close_time: '21:00:00',
      },
      false
    );
    expect(result.description).toBe('매일 아침 굽는 동네 베이커리입니다.');
    expect(result.addressDetail).toBe('1층');
    expect(result.image).toBe('https://example.com/store.jpg');
    expect(result.openTime).toBe('09:00:00');
    expect(result.closeTime).toBe('21:00:00');
  });

  it('canSell 파라미터를 DTO에 그대로 반영한다', () => {
    expect(mapStoreRow(baseRow, false).canSell).toBe(false);
    expect(mapStoreRow(baseRow, true).canSell).toBe(true);
    expect(mapStoreRow({ ...baseRow, status: 'active' }, true).canSell).toBe(
      true
    );
  });
});
