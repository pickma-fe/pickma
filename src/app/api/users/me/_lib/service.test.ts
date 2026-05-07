import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceRoleClient } from '@/lib/supabase/service';
import { mapUserRow } from '@/app/api/users/_lib/mapper';

import { updateUser } from './service';

vi.mock('@/lib/supabase/service');
vi.mock('@/app/api/users/_lib/mapper');

const mockRow = {
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

const mockUserResponse = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  role: 'customer' as const,
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function makeServiceClient(result: {
  data: typeof mockRow | null;
  error: { code: string } | null;
}) {
  const updateFn = vi.fn();
  const eqFn = vi.fn();

  const client = {
    from: () => ({
      update: updateFn.mockReturnValue({
        eq: eqFn.mockReturnValue({
          select: () => ({
            single: () => Promise.resolve(result),
          }),
        }),
      }),
    }),
  };

  return { client, updateFn, eqFn };
}

describe('updateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mapUserRow).mockReturnValue(mockUserResponse);
  });

  it('업데이트 성공 시 올바른 인자로 update/eq를 호출하고 mapUserRow 결과를 반환한다', async () => {
    const { client, updateFn, eqFn } = makeServiceClient({
      data: mockRow,
      error: null,
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    const result = await updateUser('user-1', { name: '홍길동' });
    expect(updateFn).toHaveBeenCalledWith({ name: '홍길동' });
    expect(eqFn).toHaveBeenCalledWith('id', 'user-1');
    expect(mapUserRow).toHaveBeenCalledWith(mockRow);
    expect(result).toBe(mockUserResponse);
  });

  it('PGRST116 에러면 NOT_FOUND를 던진다', async () => {
    const { client } = makeServiceClient({
      data: null,
      error: { code: 'PGRST116' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      updateUser('user-1', { name: '홍길동' })
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      statusCode: 404,
    });
  });

  it('기타 Supabase 에러면 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const { client } = makeServiceClient({
      data: null,
      error: { code: '42501' },
    });
    vi.mocked(createServiceRoleClient).mockReturnValue(
      client as unknown as ReturnType<typeof createServiceRoleClient>
    );
    await expect(
      updateUser('user-1', { name: '홍길동' })
    ).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    });
  });
});
