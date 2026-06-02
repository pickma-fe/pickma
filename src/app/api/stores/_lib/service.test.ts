import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServerClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { mapStoreRow } from '@/app/api/stores/_lib/mapper';

import { createStore, getMyStore, updateMyStore } from './service';

vi.mock('@/lib/supabase/server');
vi.mock('@/lib/supabase/service');
vi.mock('@/app/api/stores/_lib/mapper');

const mockBody = {
  name: '픽마 베이커리',
  businessNumber: '123-45-67890',
  phone: '02-1234-5678',
  address: '서울시 마포구 월드컵북로 12',
  region: '서울 마포구',
};

const mockRow = {
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

const mockStoreResponse = {
  id: 'store-1',
  userId: 'user-1',
  name: '픽마 베이커리',
  businessNumber: '123-45-67890',
  phone: '02-1234-5678',
  address: '서울시 마포구 월드컵북로 12',
  region: '서울 마포구',
  status: 'active' as const,
  operationStatus: 'open' as const,
  canSell: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

type CheckResult = {
  data: { id: string } | null;
  error: { code: string } | null;
};
type InsertResult = {
  data: typeof mockRow | null;
  error: { code: string } | null;
};

function makeServiceClient(
  checkResult: CheckResult,
  insertResult: InsertResult
) {
  const insertFn = vi.fn();

  const client = {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'stores') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve(checkResult),
            }),
          }),
          insert: insertFn.mockReturnValue({
            select: () => ({
              single: () => Promise.resolve(insertResult),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table in test stub: ${table}`);
    }),
  };

  return { client, insertFn };
}

describe('createStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapStoreRow).mockReturnValue(mockStoreResponse);
  });

  it('이미 가게가 있으면 STORE_ALREADY_EXISTS를 던진다', async () => {
    const { client } = makeServiceClient(
      { data: { id: 'store-existing' }, error: null },
      { data: null, error: null }
    );
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(createStore('user-1', mockBody)).rejects.toMatchObject({
      code: 'STORE_ALREADY_EXISTS',
      statusCode: 409,
    });
  });

  it('중복 확인 DB 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const { client } = makeServiceClient(
      { data: null, error: { code: '42501' } },
      { data: null, error: null }
    );
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(createStore('user-1', mockBody)).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });

  it('정상 생성 시 INSERT payload에 status=active가 있고 mapStoreRow(row, true) 결과를 반환한다', async () => {
    const { client, insertFn } = makeServiceClient(
      { data: null, error: null },
      { data: mockRow, error: null }
    );
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    const result = await createStore('user-1', mockBody);
    const insertPayload = insertFn.mock.calls[0][0];
    expect(insertPayload.status).toBe('active');
    expect(insertPayload).not.toHaveProperty('created_at');
    expect(insertPayload).not.toHaveProperty('updated_at');
    expect(mapStoreRow).toHaveBeenCalledWith(mockRow, true);
    expect(result).toBe(mockStoreResponse);
  });

  it('openTime/closeTime 없으면 null로 INSERT한다', async () => {
    const { client, insertFn } = makeServiceClient(
      { data: null, error: null },
      { data: mockRow, error: null }
    );
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await createStore('user-1', mockBody);
    const insertPayload = insertFn.mock.calls[0][0];
    expect(insertPayload.open_time).toBeNull();
    expect(insertPayload.close_time).toBeNull();
  });

  it('openTime/closeTime 있으면 앞 8자만 INSERT한다', async () => {
    const { client, insertFn } = makeServiceClient(
      { data: null, error: null },
      { data: mockRow, error: null }
    );
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await createStore('user-1', {
      ...mockBody,
      openTime: '09:00:00.000',
      closeTime: '21:30:00.000',
    });
    const insertPayload = insertFn.mock.calls[0][0];
    expect(insertPayload.open_time).toBe('09:00:00');
    expect(insertPayload.close_time).toBe('21:30:00');
  });

  it('INSERT unique 충돌(23505) 시 STORE_ALREADY_EXISTS를 던진다', async () => {
    const { client } = makeServiceClient(
      { data: null, error: null },
      { data: null, error: { code: '23505' } }
    );
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(createStore('user-1', mockBody)).rejects.toMatchObject({
      code: 'STORE_ALREADY_EXISTS',
      statusCode: 409,
    });
  });

  it('INSERT 기타 DB 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const { client } = makeServiceClient(
      { data: null, error: null },
      { data: null, error: { code: '42501' } }
    );
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(createStore('user-1', mockBody)).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });
});

type ServerClientRow = Omit<typeof mockRow, 'status'> & {
  status: 'active' | 'inactive';
};

type UpdateClientRow = Omit<typeof mockRow, 'status' | 'operation_status'> & {
  status: 'active' | 'inactive';
  operation_status: 'open' | 'closed';
};

function makeUpdateMockClient(
  updateResult: {
    data: UpdateClientRow | null;
    error: { code: string } | null;
  },
  fallbackResult: {
    data: { status: 'active' | 'inactive' } | null;
    error: null;
  } = { data: null, error: null }
) {
  const chain = {
    update: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(updateResult),
    maybeSingle: vi.fn().mockResolvedValue(fallbackResult),
  };
  return { from: vi.fn().mockReturnValue(chain) };
}

function makeServerClient(result: {
  data: ServerClientRow | null;
  error: { code: string } | null;
}) {
  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'stores') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve(result),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table in test stub: ${table}`);
    }),
  };
}

describe('updateMyStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapStoreRow).mockReturnValue(mockStoreResponse);
  });

  it('operationStatus: closed 변경 성공 시 mapStoreRow(row, false)를 호출한다', async () => {
    const closedRow = { ...mockRow, operation_status: 'closed' as const };
    const client = makeUpdateMockClient({ data: closedRow, error: null });
    vi.mocked(createServerClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    await updateMyStore('user-1', 'seller', { operationStatus: 'closed' });
    expect(mapStoreRow).toHaveBeenCalledWith(closedRow, false);
  });

  it('inactive 가게에서 operationStatus 변경 시도 시 STORE_INACTIVE를 던진다', async () => {
    const client = makeUpdateMockClient(
      { data: null, error: { code: 'PGRST116' } },
      { data: { ...mockRow, status: 'inactive' as const }, error: null }
    );
    vi.mocked(createServerClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    await expect(
      updateMyStore('user-1', 'seller', { operationStatus: 'closed' })
    ).rejects.toMatchObject({ code: 'STORE_INACTIVE', statusCode: 403 });
  });

  it('operationStatus 변경 시 가게가 없으면 STORE_NOT_FOUND를 던진다', async () => {
    const client = makeUpdateMockClient(
      { data: null, error: { code: 'PGRST116' } },
      { data: null, error: null }
    );
    vi.mocked(createServerClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    await expect(
      updateMyStore('user-1', 'seller', { operationStatus: 'open' })
    ).rejects.toMatchObject({ code: 'STORE_NOT_FOUND', statusCode: 404 });
  });

  it('inactive 가게에서 operationStatus 외 정보 수정은 허용하고 mapStoreRow(row, false)를 호출한다', async () => {
    const inactiveRow = { ...mockRow, status: 'inactive' as const };
    const client = makeUpdateMockClient({ data: inactiveRow, error: null });
    vi.mocked(createServerClient).mockResolvedValue(
      client as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    await updateMyStore('user-1', 'seller', { name: '새이름' });
    expect(mapStoreRow).toHaveBeenCalledWith(inactiveRow, false);
  });
});

describe('getMyStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapStoreRow).mockReturnValue(mockStoreResponse);
  });

  it('가게가 없으면 STORE_NOT_FOUND를 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeServerClient({ data: null, error: null }) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );
    await expect(getMyStore('user-1', 'customer')).rejects.toMatchObject({
      code: 'STORE_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('DB 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeServerClient({
        data: null,
        error: { code: '42501' },
      }) as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    await expect(getMyStore('user-1', 'customer')).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });

  it('role=seller, status=active, operation_status=open이면 mapStoreRow(row, true)를 호출한다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeServerClient({
        data: { ...mockRow, status: 'active' as const },
        error: null,
      }) as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    await getMyStore('user-1', 'seller');
    expect(mapStoreRow).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' }),
      true
    );
  });

  it('role=customer이면 mapStoreRow(row, false)를 호출한다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeServerClient({
        data: { ...mockRow, status: 'active' as const },
        error: null,
      }) as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    await getMyStore('user-1', 'customer');
    expect(mapStoreRow).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' }),
      false
    );
  });

  it('role=seller, status=inactive이면 mapStoreRow(row, false)를 호출한다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeServerClient({
        data: { ...mockRow, status: 'inactive' as const },
        error: null,
      }) as unknown as Awaited<ReturnType<typeof createServerClient>>
    );
    await getMyStore('user-1', 'seller');
    expect(mapStoreRow).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'inactive' }),
      false
    );
  });
});
