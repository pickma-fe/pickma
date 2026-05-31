import { beforeEach, describe, expect, it, vi } from 'vitest';

import { serverApiClient } from '../serverApiClient';
import { categoryServerApi } from './categoryServerApi';

vi.mock('../serverApiClient', () => ({
  serverApiClient: {
    get: vi.fn(),
  },
}));

describe('categoryServerApi', () => {
  beforeEach(() => {
    vi.mocked(serverApiClient.get).mockReset();
  });

  it('카테고리 endpoint를 서버 API client로 호출하고 mapper 결과를 반환한다', async () => {
    vi.mocked(serverApiClient.get).mockResolvedValue([
      {
        id: '00000000-0000-4000-8000-000000000011',
        name: '베이커리',
        icon: 'bread',
        sortOrder: 1,
      },
    ]);

    const result = await categoryServerApi.getCategories();

    expect(serverApiClient.get).toHaveBeenCalledWith('/api/categories');
    expect(result).toEqual([
      {
        id: '00000000-0000-4000-8000-000000000011',
        name: '베이커리',
        icon: 'bread',
        sortOrder: 1,
      },
    ]);
  });
});
