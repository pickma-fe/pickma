import type { ApiErrorResponse, ApiSuccess } from '@/contracts/common';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: { path: string; message: string }[];

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: { path: string; message: string }[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
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

function buildUrl(path: string, params?: object): string {
  if (!params) return path;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export const apiClient = {
  get<T>(path: string, params?: object): Promise<T> {
    return request<T>(buildUrl(path, params), { method: 'GET' });
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  },

  delete<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'DELETE',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  },
};
