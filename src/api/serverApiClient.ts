import type { ApiErrorResponse, ApiSuccess } from '@/contracts/common';

import { ApiError } from './apiClient';

function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  if (!body || typeof body !== 'object') return false;

  const response = body as Partial<ApiErrorResponse>;
  const error = response.error as Partial<ApiErrorResponse['error']>;

  return (
    typeof response.statusCode === 'number' &&
    Boolean(error) &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  );
}

function buildServerUrl(path: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new ApiError(
      500,
      'INTERNAL_SERVER_ERROR',
      '앱 URL 환경변수를 확인할 수 없습니다.'
    );
  }

  return new URL(path, appUrl).toString();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildServerUrl(path);
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
    if (!isApiErrorResponse(body)) {
      throw new ApiError(
        res.status,
        'INTERNAL_SERVER_ERROR',
        'API 오류 응답 형식이 올바르지 않습니다.'
      );
    }

    const err = body;
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
