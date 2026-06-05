import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { getAdminStores } from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const MOCK_STORE = {
  id: 'store-00000000-0000-4000-8000-000000000001',
  user_id: 'user-00000000-0000-4000-8000-000000000001',
  name: '픽마 베이커리',
  description: '테스트 가게',
  business_number: '123-45-67890',
  phone: '02-1234-5678',
  address: '서울시 마포구',
  address_detail: '1층',
  region: '서울 마포구',
  image: null,
  open_time: null,
  close_time: null,
  status: 'active' as const,
  operation_status: 'open' as const,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

interface StoreQuerySpies {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  ilike: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
}

function buildStoresClient({
  stores = [MOCK_STORE],
  count = stores.length,
  error = null,
}: {
  stores?: (typeof MOCK_STORE)[];
  count?: number;
  error?: { message: string } | null;
} = {}): {
  client: ReturnType<typeof createServiceRoleClient>;
  storeQuery: StoreQuerySpies;
} {
  const storeQuery: StoreQuerySpies = {
    select: vi.fn(),
    eq: vi.fn(),
    ilike: vi.fn(),
    or: vi.fn(),
    range: vi.fn(),
  };
  storeQuery.eq.mockReturnValue(storeQuery);
  storeQuery.ilike.mockReturnValue(storeQuery);
  storeQuery.or.mockReturnValue(storeQuery);
  storeQuery.range.mockResolvedValue({
    data: stores,
    count,
    error,
  });

  const client = {
    from: vi.fn().mockReturnValue({
      select: storeQuery.select.mockReturnValue({
        order: vi.fn().mockReturnValue(storeQuery),
      }),
    }),
  } as unknown as ReturnType<typeof createServiceRoleClient>;

  return { client, storeQuery };
}

describe('getAdminStores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('관리자 가게 목록을 반환한다', async () => {
    const { client, storeQuery } = buildStoresClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    const result = await getAdminStores({ page: 1, pageSize: 20 });

    expect(storeQuery.select).toHaveBeenCalledWith(
      'id,user_id,name,description,business_number,phone,address,address_detail,region,image,status,operation_status,created_at,updated_at',
      { count: 'exact' }
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('픽마 베이커리');
    expect(result.items[0].status).toBe('active');
    expect(result.totalCount).toBe(1);
  });

  it('status, region, keyword 필터와 pagination range를 적용한다', async () => {
    const { client, storeQuery } = buildStoresClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getAdminStores({
      page: 2,
      pageSize: 10,
      status: 'inactive',
      region: '서울',
      keyword: '픽마',
    });

    expect(storeQuery.eq).toHaveBeenCalledWith('status', 'inactive');
    expect(storeQuery.ilike).toHaveBeenCalledWith('region', '%서울%');
    expect(storeQuery.or).toHaveBeenCalledWith(
      'name.ilike.%픽마%,business_number.ilike.%픽마%,phone.ilike.%픽마%,address.ilike.%픽마%'
    );
    expect(storeQuery.range).toHaveBeenCalledWith(10, 19);
  });

  it('검색어 escape 후 빈 값이면 keyword 필터를 적용하지 않는다', async () => {
    const { client, storeQuery } = buildStoresClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getAdminStores({
      page: 1,
      pageSize: 20,
      keyword: '%,()',
    });

    expect(storeQuery.or).not.toHaveBeenCalled();
  });

  it('LIKE wildcard 문자를 escape해서 검색 조건에 사용한다', async () => {
    const { client, storeQuery } = buildStoresClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getAdminStores({
      page: 1,
      pageSize: 20,
      keyword: '픽_마*',
      region: '서_울',
    });

    expect(storeQuery.ilike).toHaveBeenCalledWith('region', '%서\\_울%');
    expect(storeQuery.or).toHaveBeenCalledWith(
      'name.ilike.%픽\\_마\\*%,business_number.ilike.%픽\\_마\\*%,phone.ilike.%픽\\_마\\*%,address.ilike.%픽\\_마\\*%'
    );
  });

  it('Supabase 오류가 있으면 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const { client } = buildStoresClient({
      stores: [],
      count: 0,
      error: { message: 'db error' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await expect(getAdminStores({ page: 1, pageSize: 20 })).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof AppError &&
        error.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });
});
