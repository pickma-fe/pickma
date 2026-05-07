import type { SupabaseClient, User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Database } from '@/lib/supabase/database';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { getOrCreateUserByAuthUser } from './current-user';

vi.mock('@/lib/supabase/service');

const baseRow = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  phone: null,
  profile_image: null,
  role: 'customer' as const,
  status: 'active' as const,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const baseAuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  user_metadata: {},
} as unknown as User;

function makeSelectClient(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ single });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { from } as unknown as SupabaseClient<Database>;
}

function mockServiceRole(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ single });
  const upsert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ upsert });
  vi.mocked(createServiceRoleClient).mockReturnValue({
    from,
  } as unknown as ReturnType<typeof createServiceRoleClient>);
}

describe('getOrCreateUserByAuthUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('기존 row가 있으면 DB 조회 결과를 반환한다', async () => {
    const supabase = makeSelectClient({ data: baseRow, error: null });

    const result = await getOrCreateUserByAuthUser(supabase, baseAuthUser);

    expect(result.id).toBe('user-1');
    expect(result.email).toBe('test@example.com');
  });

  it('row가 없으면 upsert 후 생성된 row를 반환한다', async () => {
    const supabase = makeSelectClient({
      data: null,
      error: { code: 'PGRST116' },
    });
    mockServiceRole({ data: baseRow, error: null });

    const result = await getOrCreateUserByAuthUser(supabase, baseAuthUser);

    expect(result.id).toBe('user-1');
  });

  it('authUser.email이 없으면 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const supabase = makeSelectClient({ data: null, error: null });
    const authUser = { ...baseAuthUser, email: undefined } as unknown as User;

    await expect(
      getOrCreateUserByAuthUser(supabase, authUser)
    ).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });

  it('PGRST116이 아닌 fetch 에러는 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const supabase = makeSelectClient({ data: null, error: { code: '42501' } });

    await expect(
      getOrCreateUserByAuthUser(supabase, baseAuthUser)
    ).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });

  it('upsert 23505 에러는 AUTH_IDENTITY_CONFLICT를 던진다', async () => {
    const supabase = makeSelectClient({
      data: null,
      error: { code: 'PGRST116' },
    });
    mockServiceRole({ data: null, error: { code: '23505' } });

    await expect(
      getOrCreateUserByAuthUser(supabase, baseAuthUser)
    ).rejects.toMatchObject({
      code: 'AUTH_IDENTITY_CONFLICT',
      statusCode: 409,
    });
  });

  it('upsert 기타 에러는 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const supabase = makeSelectClient({
      data: null,
      error: { code: 'PGRST116' },
    });
    mockServiceRole({ data: null, error: { code: '42501' } });

    await expect(
      getOrCreateUserByAuthUser(supabase, baseAuthUser)
    ).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });

  describe('name 추출 우선순위', () => {
    it('full_name → name → email local-part 순으로 사용한다', async () => {
      const supabase = makeSelectClient({
        data: null,
        error: { code: 'PGRST116' },
      });

      const single = vi.fn();
      const select = vi.fn().mockReturnValue({ single });
      const upsert = vi.fn().mockReturnValue({ select });
      const from = vi.fn().mockReturnValue({ upsert });
      vi.mocked(createServiceRoleClient).mockReturnValue({
        from,
      } as unknown as ReturnType<typeof createServiceRoleClient>);

      single.mockResolvedValue({
        data: { ...baseRow, name: '풀네임' },
        error: null,
      });
      await getOrCreateUserByAuthUser(supabase, {
        ...baseAuthUser,
        user_metadata: { full_name: '풀네임', name: '네임' },
      });
      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({ name: '풀네임' }),
        expect.anything()
      );

      single.mockResolvedValue({
        data: { ...baseRow, name: '네임' },
        error: null,
      });
      await getOrCreateUserByAuthUser(
        makeSelectClient({ data: null, error: { code: 'PGRST116' } }),
        {
          ...baseAuthUser,
          user_metadata: { name: '네임' },
        }
      );
      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({ name: '네임' }),
        expect.anything()
      );

      single.mockResolvedValue({
        data: { ...baseRow, name: 'test' },
        error: null,
      });
      await getOrCreateUserByAuthUser(
        makeSelectClient({ data: null, error: { code: 'PGRST116' } }),
        {
          ...baseAuthUser,
          user_metadata: {},
        }
      );
      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test' }),
        expect.anything()
      );
    });
  });
});
