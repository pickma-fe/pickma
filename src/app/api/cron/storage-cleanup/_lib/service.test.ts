import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceRoleClient } from '@/lib/supabase/service';
import type { Logger } from '@/app/api/_lib/logger';

import { runStorageCleanup } from './service';

const mockLogger: Logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const NOW = new Date('2025-06-09T00:00:00.000Z').getTime();

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function daysAgo(days: number): string {
  return new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString();
}

type MockFile = {
  name: string;
  id: string | null;
  created_at?: string | null;
};

type DbRow = { storage_path: string };
type DbResponse = DbRow[] | { error: object };

function makeClient({
  dbResponses = [[]] as DbResponse[],
  listResponses = [] as (MockFile[] | { error: object })[],
  removeError = null as object | null,
} = {}) {
  let dbCallIndex = 0;
  const mockRange = vi.fn().mockImplementation(() => {
    const response = dbResponses[dbCallIndex++] ?? [];
    if (Array.isArray(response)) {
      return Promise.resolve({ data: response, error: null });
    }
    return Promise.resolve({ data: null, error: response.error });
  });

  const mockSelect = vi.fn().mockReturnValue({ range: mockRange });
  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

  let listCallIndex = 0;
  const mockList = vi.fn().mockImplementation(() => {
    const response = listResponses[listCallIndex++] ?? [];
    if (Array.isArray(response)) {
      return Promise.resolve({ data: response, error: null });
    }
    return Promise.resolve({ data: null, error: response.error });
  });

  const mockRemove = vi.fn().mockResolvedValue({ error: removeError });

  const mockStorageFrom = vi.fn().mockReturnValue({
    list: mockList,
    remove: mockRemove,
  });

  vi.mocked(createServiceRoleClient).mockReturnValue({
    from: mockFrom,
    storage: { from: mockStorageFrom },
  } as unknown as ReturnType<typeof createServiceRoleClient>);

  return { mockFrom, mockList, mockRemove, mockStorageFrom };
}

describe('runStorageCleanup', () => {
  it('bucket이 비어있으면 deletedCount: 0, remove 미호출', async () => {
    const { mockRemove } = makeClient({ listResponses: [[]] });

    const result = await runStorageCleanup(mockLogger);

    expect(result.deletedCount).toBe(0);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('모든 파일이 DB에 존재하면 remove 미호출', async () => {
    const path = 'user-1/upload-1/business_license/file.pdf';
    const { mockRemove } = makeClient({
      dbResponses: [[{ storage_path: path }]],
      listResponses: [
        [{ name: 'user-1', id: null }],
        [{ name: 'upload-1', id: null }],
        [{ name: 'business_license', id: null }],
        [{ name: 'file.pdf', id: 'file-id', created_at: daysAgo(31) }],
      ],
    });

    const result = await runStorageCleanup(mockLogger);

    expect(result.deletedCount).toBe(0);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('DB에 없고 29일 파일은 삭제하지 않는다', async () => {
    const { mockRemove } = makeClient({
      listResponses: [
        [{ name: 'user-1', id: null }],
        [{ name: 'upload-1', id: null }],
        [{ name: 'business_license', id: null }],
        [{ name: 'file.pdf', id: 'file-id', created_at: daysAgo(29) }],
      ],
    });

    const result = await runStorageCleanup(mockLogger);

    expect(result.deletedCount).toBe(0);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('DB에 없고 정확히 30일 파일은 삭제하지 않는다', async () => {
    const { mockRemove } = makeClient({
      listResponses: [
        [{ name: 'file.pdf', id: 'file-id', created_at: daysAgo(30) }],
      ],
    });

    const result = await runStorageCleanup(mockLogger);

    expect(result.deletedCount).toBe(0);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('DB에 없고 31일 파일은 삭제한다', async () => {
    const { mockRemove } = makeClient({
      listResponses: [
        [{ name: 'user-1', id: null }],
        [{ name: 'upload-1', id: null }],
        [{ name: 'business_license', id: null }],
        [{ name: 'file.pdf', id: 'file-id', created_at: daysAgo(31) }],
      ],
    });

    const result = await runStorageCleanup(mockLogger);

    expect(result.deletedCount).toBe(1);
    expect(mockRemove).toHaveBeenCalledWith([
      'user-1/upload-1/business_license/file.pdf',
    ]);
  });

  it('created_at이 null인 파일은 삭제하지 않는다', async () => {
    const { mockRemove } = makeClient({
      listResponses: [[{ name: 'file.pdf', id: 'file-id', created_at: null }]],
    });

    const result = await runStorageCleanup(mockLogger);

    expect(result.deletedCount).toBe(0);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('중첩 가상 폴더 구조에서 31일 orphan 파일을 찾아 삭제한다', async () => {
    const { mockRemove } = makeClient({
      listResponses: [
        [
          { name: 'user-1', id: null },
          { name: 'user-2', id: null },
        ],
        [{ name: 'upload-1', id: null }],
        [{ name: 'file-a.pdf', id: 'id-a', created_at: daysAgo(31) }],
        [{ name: 'upload-2', id: null }],
        [{ name: 'file-b.pdf', id: 'id-b', created_at: daysAgo(10) }],
      ],
    });

    const result = await runStorageCleanup(mockLogger);

    expect(result.deletedCount).toBe(1);
    expect(mockRemove).toHaveBeenCalledWith(['user-1/upload-1/file-a.pdf']);
  });

  it('DB 2페이지 이상 조회 시 모든 경로를 수집해 orphan을 오판하지 않는다', async () => {
    const page1 = Array.from({ length: 1000 }, (_, i) => ({
      storage_path: `other-path-${i}`,
    }));
    const page2 = [{ storage_path: 'user-1/file.pdf' }];

    const { mockRemove } = makeClient({
      dbResponses: [page1, page2],
      listResponses: [
        [{ name: 'user-1', id: null }],
        [{ name: 'file.pdf', id: 'file-id', created_at: daysAgo(31) }],
      ],
    });

    const result = await runStorageCleanup(mockLogger);

    expect(result.deletedCount).toBe(0);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('DB 조회 실패 시 AppError(500)을 throw하고 remove 미호출', async () => {
    const { mockRemove } = makeClient({
      dbResponses: [{ error: { message: 'db error' } }],
    });

    await expect(runStorageCleanup(mockLogger)).rejects.toMatchObject({
      statusCode: 500,
    });
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('storage.list() 오류 시 AppError(500)을 throw하고 remove 미호출', async () => {
    const { mockRemove } = makeClient({
      listResponses: [{ error: { message: 'storage error' } }],
    });

    await expect(runStorageCleanup(mockLogger)).rejects.toMatchObject({
      statusCode: 500,
    });
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('삭제 실패 시 AppError(500)을 throw한다', async () => {
    makeClient({
      listResponses: [
        [{ name: 'file.pdf', id: 'file-id', created_at: daysAgo(31) }],
      ],
      removeError: { message: 'remove error' },
    });

    await expect(runStorageCleanup(mockLogger)).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});
