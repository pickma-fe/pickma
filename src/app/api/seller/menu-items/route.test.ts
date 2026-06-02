import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MenuItemResponse } from '@/contracts/menu-item';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { requireSellerStore } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { mockSellerMenuItems } from '@/mocks/seller';

import { createSellerMenuItem, getSellerMenuItems } from './_lib/service';
import { GET, POST } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireSellerStore: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  getSellerMenuItems: vi.fn(),
  createSellerMenuItem: vi.fn(),
}));

const STORE_ID = '00000000-0000-4000-8000-000000000031';
const CATEGORY_BAKERY = '00000000-0000-4000-8000-000000000011';

const sellerResult = {
  authUser: {},
  serviceUser: {},
  store: { id: STORE_ID },
} as Awaited<ReturnType<typeof requireSellerStore>>;

function makeGetRequest(search = ''): NextRequest {
  return new NextRequest(
    `http://localhost/api/seller/menu-items${search ? `?${search}` : ''}`
  );
}

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/seller/menu-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/seller/menu-items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mock 모드에서 invalid query는 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(makeGetRequest('unknown=value'));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('mock 모드에서 status 필터를 적용한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(makeGetRequest('status=active'));
    const body = (await res.json()) as { data: MenuItemResponse[] };

    expect(res.status).toBe(200);
    expect(body.data.every((i) => i.status === 'active')).toBe(true);
    expect(body.data.length).toBe(
      mockSellerMenuItems.filter((i) => i.status === 'active').length
    );
  });

  it('mock 모드에서 categoryId 필터를 적용한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(makeGetRequest(`categoryId=${CATEGORY_BAKERY}`));
    const body = (await res.json()) as { data: MenuItemResponse[] };

    expect(res.status).toBe(200);
    expect(body.data.every((i) => i.categoryId === CATEGORY_BAKERY)).toBe(true);
  });

  it('mock 모드에서 keyword 필터를 적용한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await GET(makeGetRequest('keyword=크루아상'));
    const body = (await res.json()) as { data: MenuItemResponse[] };

    expect(res.status).toBe(200);
    expect(body.data.length).toBe(1);
    expect(body.data[0].name).toContain('크루아상');
  });

  it('mock 모드에서 requireSellerStore를 호출하지 않는다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    await GET(makeGetRequest());

    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('real 모드에서는 requireSellerStore store id로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(getSellerMenuItems).mockResolvedValue([]);

    const res = await GET(makeGetRequest());

    expect(res.status).toBe(200);
    expect(getSellerMenuItems).toHaveBeenCalledWith(STORE_ID, {});
  });

  it('requireSellerStore가 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockRejectedValue(
      new AppError(ERROR_CODE.STORE_INACTIVE, 403)
    );

    const res = await GET(makeGetRequest());
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('STORE_INACTIVE');
  });
});

describe('POST /api/seller/menu-items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    categoryId: CATEGORY_BAKERY,
    name: '테스트 메뉴',
    originalPrice: 10000,
  };

  it('mock 모드에서 body validation 후 201을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await POST(makePostRequest(validBody));

    expect(res.status).toBe(201);
    expect(requireSellerStore).not.toHaveBeenCalled();
  });

  it('validation 실패 시 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);

    const res = await POST(makePostRequest({ name: '메뉴만' }));
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('real 모드에서는 requireSellerStore store id로 service를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerResult);
    vi.mocked(createSellerMenuItem).mockResolvedValue({} as MenuItemResponse);

    const res = await POST(makePostRequest(validBody));

    expect(res.status).toBe(201);
    expect(createSellerMenuItem).toHaveBeenCalledWith(
      STORE_ID,
      expect.objectContaining({ name: '테스트 메뉴', originalPrice: 10000 })
    );
  });
});
