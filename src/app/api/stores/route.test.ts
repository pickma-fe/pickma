import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { StoreResponse } from '@/contracts/store';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSeller } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { createStore } from './_lib/service';
import { POST } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireSeller: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  createStore: vi.fn(),
}));

const USER_ID = '00000000-0000-4000-8000-000000000021';
const store = {
  id: 'store-1',
  status: 'active',
  operationStatus: 'open',
  canSell: true,
} as StoreResponse;

const sellerResult = {
  authUser: {},
  serviceUser: { id: USER_ID },
} as Awaited<ReturnType<typeof requireSeller>>;

const validBody = {
  name: '픽마 베이커리',
  businessNumber: '123-45-67890',
  phone: '02-1234-5678',
  address: '서울시 마포구 월드컵북로 12',
  region: '서울 마포구',
};

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/stores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/stores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mock 모드에서는 validation 통과 후 mockApprovedStore를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await POST(makeRequest(validBody) as never);
    const body = (await res.json()) as { data: StoreResponse };

    expect(res.status).toBe(201);
    expect(body.data.status).toBe('active');
    expect(requireSeller).not.toHaveBeenCalled();
  });

  it('real 모드에서는 requireSeller user id로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSeller).mockResolvedValue(sellerResult);
    vi.mocked(createStore).mockResolvedValue(store);

    const res = await POST(makeRequest(validBody) as never);

    expect(res.status).toBe(201);
    expect(createStore).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({ name: '픽마 베이커리' })
    );
  });

  it('requireSeller가 FORBIDDEN을 던지면 403을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSeller).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await POST(makeRequest(validBody) as never);
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('validation 실패 시 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);

    const res = await POST(makeRequest({ ...validBody, name: '' }) as never);
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
