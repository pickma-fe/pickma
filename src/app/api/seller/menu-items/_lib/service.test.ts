import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import type { MenuItemRow } from './mapper';
import {
  createSellerMenuItem,
  deleteSellerMenuItem,
  getSellerMenuItems,
  updateSellerMenuItem,
} from './service';

vi.mock('@/lib/supabase/service');

const STORE_ID = '00000000-0000-4000-8000-000000000031';
const MENU_ITEM_ID = '00000000-0000-4000-8000-000000000041';
const CATEGORY_ID = '00000000-0000-4000-8000-000000000011';

const menuItemRow: MenuItemRow = {
  id: MENU_ITEM_ID,
  store_id: STORE_ID,
  category_id: CATEGORY_ID,
  name: '크루아상 세트',
  description: null,
  image: null,
  original_price: 12000,
  status: 'active',
  created_at: '2026-05-18T09:00:00.000Z',
  updated_at: '2026-05-18T09:00:00.000Z',
  categories: { id: CATEGORY_ID, name: '베이커리' },
};

function buildChain(result: { data?: unknown; error?: object | null }) {
  const chain = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
    then: vi.fn(
      (
        onFulfilled?: (value: typeof result) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) => Promise.resolve(result).then(onFulfilled, onRejected)
    ),
  };
  chain.select.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.ilike.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  return chain;
}

function mockServiceClient(client: object): void {
  vi.mocked(createServiceRoleClient).mockReturnValue(
    client as ReturnType<typeof createServiceRoleClient>
  );
}

describe('getSellerMenuItems', () => {
  beforeEach(() => vi.clearAllMocks());

  it('store_id 기준으로 메뉴 목록을 반환한다', async () => {
    const chain = buildChain({ data: [menuItemRow], error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    const result = await getSellerMenuItems(STORE_ID, {});

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(MENU_ITEM_ID);
    expect(result[0].categoryId).toBe(CATEGORY_ID);
    expect(result[0].categoryName).toBe('베이커리');
  });

  it('status 필터가 있으면 eq를 호출한다', async () => {
    const chain = buildChain({ data: [], error: null });
    const client = { from: vi.fn().mockReturnValue(chain) };
    mockServiceClient(client);

    await getSellerMenuItems(STORE_ID, { status: 'active' });

    expect(chain.eq).toHaveBeenCalledWith('status', 'active');
  });

  it('keyword 필터가 있으면 ilike를 호출한다', async () => {
    const chain = buildChain({ data: [], error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    await getSellerMenuItems(STORE_ID, { keyword: '크루아상' });

    expect(chain.ilike).toHaveBeenCalledWith('name', '%크루아상%');
  });

  it('inactive 메뉴도 status 필터 없이 기본 조회에 포함된다', async () => {
    const inactiveRow = {
      ...menuItemRow,
      id: 'inactive-id',
      status: 'inactive',
    };
    const chain = buildChain({ data: [menuItemRow, inactiveRow], error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    const result = await getSellerMenuItems(STORE_ID, {});

    expect(result).toHaveLength(2);
  });
});

describe('createSellerMenuItem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('카테고리 존재 확인 후 메뉴를 생성한다', async () => {
    const catChain = buildChain({ data: { id: CATEGORY_ID }, error: null });
    const insertChain = buildChain({ data: menuItemRow, error: null });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(catChain)
        .mockReturnValueOnce(insertChain),
    };
    mockServiceClient(client);

    const result = await createSellerMenuItem(STORE_ID, {
      categoryId: CATEGORY_ID,
      name: '크루아상 세트',
      originalPrice: 12000,
    });

    expect(result.id).toBe(MENU_ITEM_ID);
  });

  it('존재하지 않는 categoryId이면 CATEGORY_NOT_FOUND를 던진다', async () => {
    const catChain = buildChain({ data: null, error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(catChain) });

    await expect(
      createSellerMenuItem(STORE_ID, {
        categoryId: CATEGORY_ID,
        name: '크루아상 세트',
        originalPrice: 12000,
      })
    ).rejects.toMatchObject({ code: ERROR_CODE.CATEGORY_NOT_FOUND });
  });
});

describe('updateSellerMenuItem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('소유권 확인 후 메뉴를 수정한다', async () => {
    const existChain = buildChain({ data: { id: MENU_ITEM_ID }, error: null });
    const updateChain = buildChain({ data: menuItemRow, error: null });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(existChain)
        .mockReturnValueOnce(updateChain),
    };
    mockServiceClient(client);

    const result = await updateSellerMenuItem(STORE_ID, MENU_ITEM_ID, {
      name: '새 이름',
    });

    expect(result.id).toBe(MENU_ITEM_ID);
  });

  it('소유권 실패 시 MENU_ITEM_NOT_FOUND를 던진다', async () => {
    const existChain = buildChain({ data: null, error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(existChain) });

    await expect(
      updateSellerMenuItem(STORE_ID, MENU_ITEM_ID, { name: '새 이름' })
    ).rejects.toMatchObject({ code: ERROR_CODE.MENU_ITEM_NOT_FOUND });
  });

  it('status: active로 inactive 메뉴를 복구한다', async () => {
    const existChain = buildChain({ data: { id: MENU_ITEM_ID }, error: null });
    const updateChain = buildChain({
      data: { ...menuItemRow, status: 'active' },
      error: null,
    });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(existChain)
        .mockReturnValueOnce(updateChain),
    };
    mockServiceClient(client);

    const result = await updateSellerMenuItem(STORE_ID, MENU_ITEM_ID, {
      status: 'active',
    });

    expect(result.status).toBe('active');
  });

  it('categoryId가 포함되면 category 존재 확인을 추가로 수행한다', async () => {
    const existChain = buildChain({ data: { id: MENU_ITEM_ID }, error: null });
    const catChain = buildChain({ data: null, error: null });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(existChain)
        .mockReturnValueOnce(catChain),
    };
    mockServiceClient(client);

    await expect(
      updateSellerMenuItem(STORE_ID, MENU_ITEM_ID, { categoryId: CATEGORY_ID })
    ).rejects.toMatchObject({ code: ERROR_CODE.CATEGORY_NOT_FOUND });
  });
});

describe('deleteSellerMenuItem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('status를 inactive로 변경하는 판매 중지 커맨드이다', async () => {
    const chain = buildChain({ data: { id: MENU_ITEM_ID }, error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    const result = await deleteSellerMenuItem(STORE_ID, MENU_ITEM_ID);

    expect(result).toBeNull();
    expect(chain.update).toHaveBeenCalledWith({ status: 'inactive' });
  });

  it('존재하지 않으면 MENU_ITEM_NOT_FOUND를 던진다', async () => {
    const chain = buildChain({ data: null, error: null });
    mockServiceClient({ from: vi.fn().mockReturnValue(chain) });

    await expect(
      deleteSellerMenuItem(STORE_ID, MENU_ITEM_ID)
    ).rejects.toMatchObject({ code: ERROR_CODE.MENU_ITEM_NOT_FOUND });
  });
});
