import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServerClient } from '@/lib/supabase/server';
import { getOrCreateUserByAuthUser } from '@/app/api/_lib/current-user';

import { requireActiveUser } from './auth';

vi.mock('@/lib/supabase/server');
vi.mock('@/app/api/_lib/current-user');

const mockAuthUser = { id: 'user-1', email: 'test@example.com' };
const mockServiceUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  role: 'customer' as const,
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function makeSupabaseClient(user: unknown) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
  };
}

describe('requireActiveUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('미인증이면 UNAUTHORIZED를 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(null) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );

    await expect(requireActiveUser()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      statusCode: 401,
    });
  });

  it('active 사용자면 authUser와 serviceUser를 반환한다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue(mockServiceUser);

    const result = await requireActiveUser();

    expect(result.authUser).toBe(mockAuthUser);
    expect(result.serviceUser).toBe(mockServiceUser);
  });

  it('suspended 사용자면 FORBIDDEN을 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue({
      ...mockServiceUser,
      status: 'suspended',
    });

    await expect(requireActiveUser()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  });

  it('deleted 사용자면 FORBIDDEN을 던진다', async () => {
    vi.mocked(createServerClient).mockResolvedValue(
      makeSupabaseClient(mockAuthUser) as unknown as Awaited<
        ReturnType<typeof createServerClient>
      >
    );
    vi.mocked(getOrCreateUserByAuthUser).mockResolvedValue({
      ...mockServiceUser,
      status: 'deleted',
    });

    await expect(requireActiveUser()).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  });
});
