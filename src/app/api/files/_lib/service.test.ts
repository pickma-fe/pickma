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

function setupStorageMock(error: unknown = null) {
  vi.mocked(createServiceRoleClient).mockReturnValue({
    storage: {
      from: vi.fn().mockReturnValue({
        remove: mockRemove.mockResolvedValue({ error }),
      }),
    },
  } as unknown as ReturnType<typeof createServiceRoleClient>);
}

describe('deleteStorageFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStorageMock();
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

  it('storage 삭제 오류 시 INTERNAL_SERVER_ERROR를 던진다', async () => {
    setupStorageMock({ message: 'storage error' });

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
