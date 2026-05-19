import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import type { Database } from '@/lib/supabase/database';

import type { CategoryRow } from './mapper';
import { getCategories } from './service';

const categoryRows: CategoryRow[] = [
  {
    id: '00000000-0000-4000-8000-000000000011',
    name: '베이커리',
    icon: '🥐',
    sort_order: 1,
  },
  {
    id: '00000000-0000-4000-8000-000000000012',
    name: '카페',
    icon: '☕',
    sort_order: 2,
  },
];

function buildChain(result: { data?: unknown; error?: object | null }) {
  const chain = {
    select: vi.fn(),
    order: vi.fn(),
    then: vi.fn(
      (
        onFulfilled?: (value: typeof result) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) => Promise.resolve(result).then(onFulfilled, onRejected)
    ),
  };
  chain.select.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  return chain;
}

function buildSupabase(result: { data?: unknown; error?: object | null }) {
  const chain = buildChain(result);
  return {
    from: vi.fn().mockReturnValue(chain),
  } as unknown as SupabaseClient<Database>;
}

describe('getCategories', () => {
  it('sort_order ASC, name ASC 순으로 카테고리 목록을 반환한다', async () => {
    const supabase = buildSupabase({ data: categoryRows, error: null });

    const result = await getCategories(supabase);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: categoryRows[0].id,
      name: '베이커리',
      icon: '🥐',
      sortOrder: 1,
    });
    expect(result[1]).toEqual({
      id: categoryRows[1].id,
      name: '카페',
      icon: '☕',
      sortOrder: 2,
    });
  });

  it('icon이 null이면 결과에서 icon 필드를 제외한다', async () => {
    const rows: CategoryRow[] = [
      {
        id: '00000000-0000-4000-8000-000000000011',
        name: '베이커리',
        icon: null,
        sort_order: 1,
      },
    ];
    const supabase = buildSupabase({ data: rows, error: null });

    const result = await getCategories(supabase);

    expect(result[0]).not.toHaveProperty('icon');
  });

  it('DB 에러 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    const supabase = buildSupabase({
      data: null,
      error: { message: 'db error' },
    });

    await expect(getCategories(supabase)).rejects.toThrow(AppError);
    await expect(getCategories(supabase)).rejects.toMatchObject({
      code: ERROR_CODE.INTERNAL_SERVER_ERROR,
    });
  });
});
