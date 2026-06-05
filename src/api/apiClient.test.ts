import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ApiError } from './apiClient';
import { apiClient } from './apiClient';

describe('apiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('성공 envelope에서 data만 반환한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          statusCode: 200,
          data: { id: 'product_1' },
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      apiClient.get<{ id: string }>('/api/products')
    ).resolves.toEqual({ id: 'product_1' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({
        credentials: 'include',
        method: 'GET',
      })
    );
  });

  it('쿼리 파라미터를 문자열로 조립한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 200, data: [] }), {
        status: 200,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.get('/api/products', {
      page: 1,
      pageSize: 20,
      region: '서울',
    });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    const parsed = new URL(calledUrl, 'http://localhost');
    expect(parsed.pathname).toBe('/api/products');
    expect(parsed.searchParams.get('page')).toBe('1');
    expect(parsed.searchParams.get('pageSize')).toBe('20');
    expect(parsed.searchParams.get('region')).toBe('서울');
  });

  it('delete는 body 없이 호출할 수 있다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 200, data: null }), {
        status: 200,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.delete('/api/resources/1');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/resources/1',
      expect.objectContaining({ method: 'DELETE' })
    );
    const calledInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(calledInit.body).toBeUndefined();
  });

  it('delete는 body를 JSON으로 직렬화해서 전송한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 200, data: null }), {
        status: 200,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.delete('/api/files', { storagePaths: ['path/a.pdf'] });

    const calledInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(calledInit.method).toBe('DELETE');
    expect(calledInit.body).toBe(
      JSON.stringify({ storagePaths: ['path/a.pdf'] })
    );
  });

  it('실패 envelope를 ApiError로 변환한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            statusCode: 400,
            error: {
              code: 'VALIDATION_ERROR',
              message: '요청 값이 올바르지 않습니다.',
              details: [{ path: 'name', message: '필수 값입니다.' }],
            },
          }),
          { status: 400 }
        )
      )
    );

    await expect(apiClient.post('/api/stores', {})).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: '요청 값이 올바르지 않습니다.',
      details: [{ path: 'name', message: '필수 값입니다.' }],
    } satisfies Partial<ApiError>);
  });
});
