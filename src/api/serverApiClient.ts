import { headers } from 'next/headers';

import type { ApiErrorResponse, ApiSuccess } from '@/contracts/common';

import { ApiError } from './apiClient';

async function buildServerUrl(path: string): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get('host');

  if (!host) {
    throw new ApiError(
      500,
      'INTERNAL_SERVER_ERROR',
      '요청 호스트를 확인할 수 없습니다.'
    );
  }

  const protocol =
    headerStore.get('x-forwarded-proto') ??
    (host.startsWith('localhost') ? 'http' : 'https');

  return `${protocol}://${host}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = await buildServerUrl(path);
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(
      res.status,
      'INTERNAL_SERVER_ERROR',
      '응답을 파싱할 수 없습니다.'
    );
  }

  if (!res.ok) {
    const err = body as ApiErrorResponse;
    throw new ApiError(
      err.statusCode,
      err.error.code,
      err.error.message,
      err.error.details
    );
  }

  return (body as ApiSuccess<T>).data;
}

export const serverApiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
  },
};
