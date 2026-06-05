import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import {
  approveSellerApplication,
  getPendingSellerApplications,
  rejectSellerApplication,
} from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const APP_ID = 'app-00000000-0000-4000-8000-000000000001';
const USER_ID = 'user-00000000-0000-4000-8000-000000000001';

const MOCK_APPLICATION = {
  id: APP_ID,
  user_id: USER_ID,
  status: 'pending' as const,
  business_number: '123-45-67890',
  company_name: '테스트 주식회사',
  representative_name: '홍길동',
  business_address: '서울시 강남구',
  business_type: '소매업',
  business_category: '식품',
  reject_reason: null,
  reviewed_at: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const MOCK_USER = {
  id: USER_ID,
  email: 'test@example.com',
  name: '홍길동',
  phone: null,
};

interface ApplicationQuerySpies {
  gte: ReturnType<typeof vi.fn>;
  lt: ReturnType<typeof vi.fn>;
  ilike: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
}

interface UserLookupSpies {
  or: ReturnType<typeof vi.fn>;
}

function buildListClient() {
  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'seller_applications') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [MOCK_APPLICATION],
                  count: 1,
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [MOCK_USER],
              error: null,
            }),
          }),
        };
      }
      // seller_application_documents
      return {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      };
    }),
  };
}

function buildFilterableListClient({
  applications = [MOCK_APPLICATION],
  count = applications.length,
  keywordUsers = [MOCK_USER],
}: {
  applications?: (typeof MOCK_APPLICATION)[];
  count?: number;
  keywordUsers?: Array<Pick<typeof MOCK_USER, 'id'>>;
} = {}): {
  client: ReturnType<typeof createServiceRoleClient>;
  applicationQuery: ApplicationQuerySpies;
  keywordUserQuery: UserLookupSpies;
} {
  const applicationQuery: ApplicationQuerySpies = {
    gte: vi.fn(),
    lt: vi.fn(),
    ilike: vi.fn(),
    or: vi.fn(),
    range: vi.fn(),
  };
  applicationQuery.gte.mockReturnValue(applicationQuery);
  applicationQuery.lt.mockReturnValue(applicationQuery);
  applicationQuery.ilike.mockReturnValue(applicationQuery);
  applicationQuery.or.mockReturnValue(applicationQuery);
  applicationQuery.range.mockResolvedValue({
    data: applications,
    count,
    error: null,
  });

  const keywordUserQuery: UserLookupSpies = {
    or: vi.fn().mockResolvedValue({
      data: keywordUsers,
      error: null,
    }),
  };
  const usersSelect = vi.fn().mockImplementation((columns: string) => {
    if (columns === 'id') return keywordUserQuery;

    return {
      in: vi.fn().mockResolvedValue({
        data: [MOCK_USER],
        error: null,
      }),
    };
  });

  const client = {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'seller_applications') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue(applicationQuery),
            }),
          }),
        };
      }
      if (table === 'users') {
        return { select: usersSelect };
      }
      return {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      };
    }),
  } as unknown as ReturnType<typeof createServiceRoleClient>;

  return { client, applicationQuery, keywordUserQuery };
}

describe('getPendingSellerApplications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pending 신청 목록을 반환한다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildListClient() as unknown as ReturnType<typeof createServiceRoleClient>
    );

    const result = await getPendingSellerApplications({
      page: 1,
      pageSize: 20,
    });
    expect(result.items).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.items[0].status).toBe('pending');
    expect(result.items[0].applicantEmail).toBe('test@example.com');
  });

  it('keyword가 있으면 user lookup과 seller application 검색 조건을 적용한다', async () => {
    const { client, applicationQuery, keywordUserQuery } =
      buildFilterableListClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getPendingSellerApplications({
      page: 1,
      pageSize: 20,
      keyword: '홍길동',
    });

    expect(keywordUserQuery.or).toHaveBeenCalledWith(
      'email.ilike.%홍길동%,name.ilike.%홍길동%,phone.ilike.%홍길동%'
    );
    expect(applicationQuery.or).toHaveBeenCalledWith(
      `company_name.ilike.%홍길동%,representative_name.ilike.%홍길동%,business_number.ilike.%홍길동%,user_id.in.(${USER_ID})`
    );
  });

  it('keyword user match가 없어도 신청 snapshot 검색 조건은 유지한다', async () => {
    const { client, applicationQuery } = buildFilterableListClient({
      keywordUsers: [],
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getPendingSellerApplications({
      page: 1,
      pageSize: 20,
      keyword: '상회',
    });

    expect(applicationQuery.or).toHaveBeenCalledWith(
      'company_name.ilike.%상회%,representative_name.ilike.%상회%,business_number.ilike.%상회%'
    );
  });

  it('createdDate가 있으면 KST 날짜 기준 UTC range를 적용한다', async () => {
    const { client, applicationQuery } = buildFilterableListClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getPendingSellerApplications({
      page: 1,
      pageSize: 20,
      createdDate: '2026-06-04',
    });

    expect(applicationQuery.gte).toHaveBeenCalledWith(
      'created_at',
      '2026-06-03T15:00:00.000Z'
    );
    expect(applicationQuery.lt).toHaveBeenCalledWith(
      'created_at',
      '2026-06-04T15:00:00.000Z'
    );
  });

  it('존재하지 않는 createdDate면 VALIDATION_ERROR를 던진다', async () => {
    const { client } = buildFilterableListClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await expect(
      getPendingSellerApplications({
        page: 1,
        pageSize: 20,
        createdDate: '2026-02-31',
      })
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.VALIDATION_ERROR
    );
  });

  it('businessCategory가 있으면 ilike 조건을 적용한다', async () => {
    const { client, applicationQuery } = buildFilterableListClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getPendingSellerApplications({
      page: 1,
      pageSize: 20,
      businessCategory: '베이커리',
    });

    expect(applicationQuery.ilike).toHaveBeenCalledWith(
      'business_category',
      '%베이커리%'
    );
  });

  it('businessCategory가 sanitize 후 비어 있으면 ilike 조건을 적용하지 않는다', async () => {
    const { client, applicationQuery } = buildFilterableListClient();
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    await getPendingSellerApplications({
      page: 1,
      pageSize: 20,
      businessCategory: '%,()',
    });

    expect(applicationQuery.ilike).not.toHaveBeenCalled();
  });

  it('필터 결과가 0건이면 필터 기준 pagination을 반환한다', async () => {
    const { client } = buildFilterableListClient({
      applications: [],
      count: 0,
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(client);

    const result = await getPendingSellerApplications({
      page: 1,
      pageSize: 20,
      businessCategory: '없는 업종',
    });

    expect(result.items).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

describe('approveSellerApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('존재하지 않는 신청이면 SELLER_APPLICATION_NOT_FOUND를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(approveSellerApplication(APP_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError &&
        e.code === ERROR_CODE.SELLER_APPLICATION_NOT_FOUND
    );
  });

  it('DB 에러 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '500', message: 'db error' },
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(approveSellerApplication(APP_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });

  it('RPC APPLICATION_NOT_PENDING이면 VALIDATION_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: APP_ID },
              error: null,
            }),
          }),
        }),
      }),
      rpc: vi
        .fn()
        .mockResolvedValue({ error: { message: 'APPLICATION_NOT_PENDING' } }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(approveSellerApplication(APP_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.VALIDATION_ERROR
    );
  });

  it('RPC 내부 오류면 INTERNAL_SERVER_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: APP_ID },
              error: null,
            }),
          }),
        }),
      }),
      rpc: vi
        .fn()
        .mockResolvedValue({ error: { message: 'unexpected error' } }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(approveSellerApplication(APP_ID)).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });
});

describe('rejectSellerApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('존재하지 않는 신청이면 SELLER_APPLICATION_NOT_FOUND를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(
      rejectSellerApplication(APP_ID, '서류 미비')
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError &&
        e.code === ERROR_CODE.SELLER_APPLICATION_NOT_FOUND
    );
  });

  it('DB 에러 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '500', message: 'db error' },
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(
      rejectSellerApplication(APP_ID, '서류 미비')
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
    );
  });

  it('이미 처리된 신청이면 VALIDATION_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'seller_applications') {
          const mockChain = {
            select: vi.fn(),
            update: vi.fn(),
            eq: vi.fn(),
            single: vi.fn(),
          };
          mockChain.select.mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: { id: APP_ID }, error: null }),
            }),
          });
          mockChain.update.mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          });
          return mockChain;
        }
        return {};
      }),
    } as unknown as ReturnType<typeof createServiceRoleClient>);

    await expect(
      rejectSellerApplication(APP_ID, '서류 미비')
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.VALIDATION_ERROR
    );
  });
});
