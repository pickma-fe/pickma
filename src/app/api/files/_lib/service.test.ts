import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceRoleClient } from '@/lib/supabase/service';

import { deleteStorageFiles } from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const USER_ID = '00000000-0000-4000-8000-000000000001';
const OWNED_PATH = `${USER_ID}/upload-1/business_license/file.pdf`;
const OTHER_PATH = `other-user-id/upload-1/business_license/file.pdf`;

const mockRemove = vi.fn();
const mockIn = vi.fn();

function setupMocks({
  refData = [] as { storage_path: string }[],
  refError = null,
  storageError = null,
} = {}) {
  mockIn.mockResolvedValue({ data: refData, error: refError });
  mockRemove.mockResolvedValue({ error: storageError });

  vi.mocked(createServiceRoleClient).mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ in: mockIn }),
    }),
    storage: {
      from: vi.fn().mockReturnValue({ remove: mockRemove }),
    },
  } as unknown as ReturnType<typeof createServiceRoleClient>);
}

describe('deleteStorageFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('userId prefix 소유 경로는 seller-application-documents bucket에서 삭제한다', async () => {
    await deleteStorageFiles(USER_ID, [OWNED_PATH]);

    expect(
      vi.mocked(createServiceRoleClient)().storage.from
    ).toHaveBeenCalledWith('seller-application-documents');
    expect(mockRemove).toHaveBeenCalledWith([OWNED_PATH]);
  });

  it('타인 userId prefix 경로 포함 시 FORBIDDEN 403을 던진다', async () => {
    await expect(
      deleteStorageFiles(USER_ID, [OWNED_PATH, OTHER_PATH])
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('전체 경로가 타인 소유면 FORBIDDEN 403을 던진다', async () => {
    await expect(
      deleteStorageFiles(USER_ID, [OTHER_PATH])
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });

  it('seller_application_documents에 참조 중인 경로가 있으면 FORBIDDEN 403을 던지고 삭제하지 않는다', async () => {
    setupMocks({ refData: [{ storage_path: OWNED_PATH }] });

    await expect(
      deleteStorageFiles(USER_ID, [OWNED_PATH])
    ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('참조 확인 DB 오류 시 INTERNAL_SERVER_ERROR를 던지고 삭제하지 않는다', async () => {
    setupMocks({ refError: { message: 'db error' } });

    await expect(
      deleteStorageFiles(USER_ID, [OWNED_PATH])
    ).rejects.toMatchObject({ statusCode: 500 });
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('storage 삭제 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    setupMocks({ storageError: { message: 'storage error' } });

    await expect(
      deleteStorageFiles(USER_ID, [OWNED_PATH])
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it('여러 소유 경로를 한 번에 삭제한다', async () => {
    const paths = [
      `${USER_ID}/upload-1/business_license/a.pdf`,
      `${USER_ID}/upload-2/food_service_permit/b.pdf`,
    ];
    await deleteStorageFiles(USER_ID, paths);

    expect(mockRemove).toHaveBeenCalledWith(paths);
  });
});
