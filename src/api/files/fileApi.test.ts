import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/api/apiClient';

import { deleteFiles } from './fileApi';

vi.mock('@/api/apiClient', () => ({
  apiClient: {
    delete: vi.fn(),
  },
}));

describe('deleteFiles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('DELETE /api/files를 storagePaths body로 호출한다', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(undefined);
    const paths = ['user-id/upload-1/a.pdf', 'user-id/upload-2/b.pdf'];

    await deleteFiles(paths);

    expect(apiClient.delete).toHaveBeenCalledWith('/api/files', {
      storagePaths: paths,
    });
  });

  it('apiClient.delete가 던진 에러를 그대로 전파한다', async () => {
    vi.mocked(apiClient.delete).mockRejectedValue(new Error('NETWORK_ERROR'));

    await expect(deleteFiles(['path/a.pdf'])).rejects.toThrow('NETWORK_ERROR');
  });
});
