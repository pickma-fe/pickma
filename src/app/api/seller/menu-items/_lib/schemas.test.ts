import { describe, expect, it } from 'vitest';

import {
  createMenuItemSchema,
  sellerMenuItemListSchema,
  updateMenuItemSchema,
} from './schemas';

const VALID_UUID = '00000000-0000-4000-8000-000000000011';

describe('sellerMenuItemListSchema', () => {
  it('파라미터 없이도 통과한다', () => {
    expect(sellerMenuItemListSchema.safeParse({}).success).toBe(true);
  });

  it('categoryId는 UUID여야 한다', () => {
    expect(
      sellerMenuItemListSchema.safeParse({ categoryId: VALID_UUID }).success
    ).toBe(true);
    expect(
      sellerMenuItemListSchema.safeParse({ categoryId: 'not-uuid' }).success
    ).toBe(false);
  });

  it('keyword는 trim 후 min(1)이어야 한다', () => {
    expect(
      sellerMenuItemListSchema.safeParse({ keyword: '크루아상' }).success
    ).toBe(true);
    expect(sellerMenuItemListSchema.safeParse({ keyword: '   ' }).success).toBe(
      false
    );
  });

  it('status는 active 또는 inactive만 허용한다', () => {
    expect(
      sellerMenuItemListSchema.safeParse({ status: 'active' }).success
    ).toBe(true);
    expect(
      sellerMenuItemListSchema.safeParse({ status: 'inactive' }).success
    ).toBe(true);
    expect(
      sellerMenuItemListSchema.safeParse({ status: 'closed' }).success
    ).toBe(false);
  });

  it('알 수 없는 파라미터는 거부한다', () => {
    expect(
      sellerMenuItemListSchema.safeParse({ unknown: 'value' }).success
    ).toBe(false);
  });
});

describe('createMenuItemSchema', () => {
  const valid = {
    categoryId: VALID_UUID,
    name: '크루아상 세트',
    originalPrice: 12000,
  };

  it('필수 필드만으로 통과한다', () => {
    expect(createMenuItemSchema.safeParse(valid).success).toBe(true);
  });

  it('categoryId는 필수이며 UUID여야 한다', () => {
    expect(
      createMenuItemSchema.safeParse({ ...valid, categoryId: undefined })
        .success
    ).toBe(false);
    expect(
      createMenuItemSchema.safeParse({ ...valid, categoryId: 'not-uuid' })
        .success
    ).toBe(false);
  });

  it('originalPrice는 양의 정수여야 한다', () => {
    expect(
      createMenuItemSchema.safeParse({ ...valid, originalPrice: 0 }).success
    ).toBe(false);
    expect(
      createMenuItemSchema.safeParse({ ...valid, originalPrice: -1 }).success
    ).toBe(false);
    expect(
      createMenuItemSchema.safeParse({ ...valid, originalPrice: 1.5 }).success
    ).toBe(false);
  });

  it('name은 100자를 초과할 수 없다', () => {
    expect(
      createMenuItemSchema.safeParse({ ...valid, name: 'a'.repeat(101) })
        .success
    ).toBe(false);
  });
});

describe('updateMenuItemSchema', () => {
  it('categoryId는 UUID여야 한다', () => {
    expect(
      updateMenuItemSchema.safeParse({ categoryId: VALID_UUID }).success
    ).toBe(true);
    expect(
      updateMenuItemSchema.safeParse({ categoryId: 'not-uuid' }).success
    ).toBe(false);
  });

  it('status는 active 또는 inactive만 허용한다', () => {
    expect(updateMenuItemSchema.safeParse({ status: 'active' }).success).toBe(
      true
    );
    expect(updateMenuItemSchema.safeParse({ status: 'inactive' }).success).toBe(
      true
    );
    expect(updateMenuItemSchema.safeParse({ status: 'deleted' }).success).toBe(
      false
    );
  });

  it('빈 객체이면 거부한다 (최소 1개 필드 필요)', () => {
    expect(updateMenuItemSchema.safeParse({}).success).toBe(false);
  });
});
