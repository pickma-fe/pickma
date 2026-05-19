import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceRoleClient } from '@/lib/supabase/service';

import type { SellerProductRow } from './mapper';
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerProducts,
  updateSellerProduct,
} from './service';

vi.mock('@/lib/supabase/service');

const STORE_ID = '00000000-0000-4000-8000-000000000031';
const PRODUCT_ID = '00000000-0000-4000-8000-000000000051';
const MENU_ITEM_ID = '00000000-0000-4000-8000-000000000041';

const productRow: SellerProductRow = {
  id: PRODUCT_ID,
  store_id: STORE_ID,
  menu_item_id: MENU_ITEM_ID,
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
    id: MENU_ITEM_ID,
    name: '마감 할인 크루아상 세트',
    image: null,
    original_price: 12000,
  },
  categories: {
    id: '00000000-0000-4000-8000-000000000011',
    name: '베이커리',
  },
  stores: {
    id: STORE_ID,
    name: '픽마 베이커리',
  },
};

function mockServiceClient(client: object): void {
  vi.mocked(createServiceRoleClient).mockReturnValue(
    client as ReturnType<typeof createServiceRoleClient>
  );
}

describe('getSellerProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('store_id 기준으로 seller 상품 목록을 조회한다', async () => {
    const chain = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn().mockResolvedValue({ data: [productRow], error: null }),
    };
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    const client = { from: vi.fn().mockReturnValue(chain) };
    mockServiceClient(client);

    const result = await getSellerProducts(STORE_ID);

    expect(client.from).toHaveBeenCalledWith('products');
    expect(chain.eq).toHaveBeenCalledWith('store_id', STORE_ID);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(PRODUCT_ID);
  });

  it('DB 에러 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const chain = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { code: '42501' },
      }),
    };
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    await expect(getSellerProducts(STORE_ID)).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });
});

describe('createSellerProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('seller store 소유 menu item을 products에 등록한다', async () => {
    const insert = vi.fn().mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: productRow, error: null }),
      }),
    });
    const client = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'menu_items') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () =>
                    Promise.resolve({
                      data: {
                        id: MENU_ITEM_ID,
                        store_id: STORE_ID,
                        category_id: productRow.category_id,
                        status: 'active',
                      },
                      error: null,
                    }),
                }),
              }),
            }),
          };
        }
        if (table === 'products') return { insert };
        throw new Error(`Unexpected table: ${table}`);
      }),
    };
    mockServiceClient(client);

    const result = await createSellerProduct(STORE_ID, {
      menuItemId: MENU_ITEM_ID,
      discountPrice: 7200,
      stock: 8,
      endAt: '2099-12-31T23:59:59.000Z',
      pickupStartTime: '10:00:00',
      pickupEndTime: '13:30:00',
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        store_id: STORE_ID,
        menu_item_id: MENU_ITEM_ID,
        category_id: productRow.category_id,
        discount_price: 7200,
      })
    );
    expect(result.id).toBe(PRODUCT_ID);
  });

  it('menu item이 seller store 소유가 아니면 MENU_ITEM_NOT_FOUND를 던진다', async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
      }),
    };
    mockServiceClient(client);

    await expect(
      createSellerProduct(STORE_ID, {
        menuItemId: MENU_ITEM_ID,
        discountPrice: 7200,
        stock: 8,
        endAt: '2099-12-31T23:59:59.000Z',
        pickupStartTime: '10:00:00',
        pickupEndTime: '13:30:00',
      })
    ).rejects.toMatchObject({ code: 'MENU_ITEM_NOT_FOUND', statusCode: 404 });
  });

  it('menu item이 inactive이면 MENU_ITEM_INACTIVE(409)를 던진다', async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: MENU_ITEM_ID,
                    store_id: STORE_ID,
                    category_id: productRow.category_id,
                    status: 'inactive',
                  },
                  error: null,
                }),
            }),
          }),
        }),
      }),
    };
    mockServiceClient(client);

    await expect(
      createSellerProduct(STORE_ID, {
        menuItemId: MENU_ITEM_ID,
        discountPrice: 7200,
        stock: 8,
        endAt: '2099-12-31T23:59:59.000Z',
        pickupStartTime: '10:00:00',
        pickupEndTime: '13:30:00',
      })
    ).rejects.toMatchObject({ code: 'MENU_ITEM_INACTIVE', statusCode: 409 });
  });
});

describe('updateSellerProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('store_id와 productId로 소유권을 확인한 뒤 상품을 수정한다', async () => {
    const update = vi.fn().mockReturnValue({
      eq: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: productRow, error: null }),
          }),
        }),
      }),
    });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({
                    data: { id: PRODUCT_ID, reserved_stock: 2 },
                    error: null,
                  }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({ update }),
    };
    mockServiceClient(client);

    const result = await updateSellerProduct(STORE_ID, PRODUCT_ID, {
      stock: 5,
      pickupStartTime: '09:00:00',
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        stock: 5,
        pickup_start_time: '09:00:00',
      })
    );
    expect(result.id).toBe(PRODUCT_ID);
  });

  it('stock이 reserved_stock보다 작으면 VALIDATION_ERROR를 던진다', async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: PRODUCT_ID, reserved_stock: 3 },
                  error: null,
                }),
            }),
          }),
        }),
      }),
    };
    mockServiceClient(client);

    await expect(
      updateSellerProduct(STORE_ID, PRODUCT_ID, { stock: 2 })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    });
  });

  it('타 store 상품이면 PRODUCT_NOT_FOUND를 던진다', async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
      }),
    };
    mockServiceClient(client);

    await expect(
      updateSellerProduct(STORE_ID, PRODUCT_ID, { stock: 5 })
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND', statusCode: 404 });
  });
});

describe('deleteSellerProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('상품을 삭제하지 않고 closed 상태로 변경한다', async () => {
    const update = vi.fn().mockReturnValue({
      eq: () => ({
        eq: () => ({
          select: () => ({
            maybeSingle: () =>
              Promise.resolve({ data: { id: PRODUCT_ID }, error: null }),
          }),
        }),
      }),
    });
    mockServiceClient({ from: vi.fn().mockReturnValue({ update }) });

    const result = await deleteSellerProduct(STORE_ID, PRODUCT_ID);

    expect(update).toHaveBeenCalledWith({ status: 'closed' });
    expect(result).toBeNull();
  });

  it('타 store 상품이면 PRODUCT_NOT_FOUND를 던진다', async () => {
    const update = vi.fn().mockReturnValue({
      eq: () => ({
        eq: () => ({
          select: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    });
    mockServiceClient({ from: vi.fn().mockReturnValue({ update }) });

    await expect(
      deleteSellerProduct(STORE_ID, PRODUCT_ID)
    ).rejects.toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
      statusCode: 404,
    });
  });
});
