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

function isApiSuccessResponse<T>(body: unknown): body is ApiSuccess<T> {
  if (!body || typeof body !== 'object') return false;

  const response = body as Partial<ApiSuccess<T>>;

  return typeof response.statusCode === 'number' && 'data' in response;
}

function assertStatusCodeMatches(
  httpStatus: number,
  envelopeStatus: number,
  message: string
): void {
  if (httpStatus === envelopeStatus) return;

  throw new ApiError(httpStatus, 'INTERNAL_SERVER_ERROR', message);
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

  if (!path.startsWith('/')) {
    throw new ApiError(
      500,
      'INTERNAL_SERVER_ERROR',
      '서버 API 경로는 상대 경로여야 합니다.'
    );
  }

  const baseUrl = new URL(appUrl);
  const url = new URL(path, baseUrl);

  if (url.origin !== baseUrl.origin) {
    throw new ApiError(
      500,
      'INTERNAL_SERVER_ERROR',
      '서버 API origin이 올바르지 않습니다.'
    );
  }

  return url.toString();
}

function buildPath(path: string, params?: object): string {
  if (!params) return path;

  const [pathname, search = ''] = path.split('?');
  const query = new URLSearchParams(search);
  for (const [key, value] of Object.entries(params)) {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      query.set(key, String(value));
    }
  }

  const queryString = query.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildServerUrl(path);
  let res: Response;

  try {
    res = await fetch(url, {
      ...init,
      cache: 'no-store',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      500,
      'INTERNAL_SERVER_ERROR',
      'API 요청을 완료할 수 없습니다.'
    );
  }

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
    assertStatusCodeMatches(
      res.status,
      err.statusCode,
      'API 오류 응답 상태가 일치하지 않습니다.'
    );

    throw new ApiError(
      err.statusCode,
      err.error.code,
      err.error.message,
      err.error.details
    );
  }

  if (!isApiSuccessResponse<T>(body)) {
    throw new ApiError(
      res.status,
      'INTERNAL_SERVER_ERROR',
      'API 성공 응답 형식이 올바르지 않습니다.'
    );
  }

  assertStatusCodeMatches(
    res.status,
    body.statusCode,
    'API 성공 응답 상태가 일치하지 않습니다.'
  );

  return body.data;
}

export const serverApiClient = {
  get<T>(path: string, params?: object): Promise<T> {
    return request<T>(buildPath(path, params), { method: 'GET' });
  },
};
