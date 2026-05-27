import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from './apiClient';
import { serverApiClient } from './serverApiClient';

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

describe('serverApiClient', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://pickma.example.com';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    vi.unstubAllGlobals();
  });

  it('신뢰 가능한 앱 URL 환경변수로 API origin을 고정한다', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 200, data: { ok: true } }), {
        status: 200,
      })
    );

    await serverApiClient.get('/api/products/1');

    expect(fetch).toHaveBeenCalledWith(
      'https://pickma.example.com/api/products/1',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('절대 URL path는 외부 origin 호출을 차단한다', async () => {
    await expect(
      serverApiClient.get('https://evil.example.com/api/products/1')
    ).rejects.toMatchObject({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fetch 네트워크 예외를 ApiError로 정규화한다', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('network failed'));

    await expect(serverApiClient.get('/api/products/1')).rejects.toMatchObject({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  it('성공 envelope가 깨지면 ApiError를 throw한다', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    await expect(serverApiClient.get('/api/products/1')).rejects.toMatchObject({
      statusCode: 200,
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  it('에러 envelope가 깨져도 안전한 ApiError를 throw한다', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: 'unexpected' }), { status: 502 })
    );

    await expect(serverApiClient.get('/api/products/1')).rejects.toMatchObject({
      statusCode: 502,
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  it('앱 URL 환경변수가 없으면 ApiError를 throw한다', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;

    await expect(serverApiClient.get('/api/products/1')).rejects.toBeInstanceOf(
      ApiError
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
