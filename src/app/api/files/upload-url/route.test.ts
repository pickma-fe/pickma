import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import {
  checkApplicationEligibility,
  requireActiveUser,
  requireSeller,
  requireSellerStore,
} from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';

import { createFileUploadUrl } from './_lib/service';
import { POST } from './route';

vi.mock('@/app/api/_lib/auth', () => ({
  requireActiveUser: vi.fn(),
  requireSeller: vi.fn(),
  requireSellerStore: vi.fn(),
  checkApplicationEligibility: vi.fn(),
}));

vi.mock('@/app/api/_lib/mock', () => ({
  isApiMockEnabled: vi.fn(),
}));

vi.mock('./_lib/service', () => ({
  createFileUploadUrl: vi.fn(),
}));

const USER_ID = '00000000-0000-4000-8000-000000000001';
const STORE_ID = '00000000-0000-4000-8000-000000000031';

const activeUserResult = {
  authUser: { id: USER_ID },
  serviceUser: { role: 'consumer', status: 'active' },
} as unknown as Awaited<ReturnType<typeof requireActiveUser>>;

const sellerResult = {
  authUser: { id: USER_ID },
  serviceUser: { role: 'seller', status: 'active' },
} as unknown as Awaited<ReturnType<typeof requireSeller>>;

const sellerStoreResult = {
  authUser: { id: USER_ID },
  serviceUser: { role: 'seller', status: 'active' },
  store: { id: STORE_ID },
} as unknown as Awaited<ReturnType<typeof requireSellerStore>>;

const mockUploadUrlResponse = {
  signedUrl: 'https://example.com/signed-url',
  storagePath: 'mock/profile_image/mock-file',
};

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/files/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/files/upload-url', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mock 모드에서 signedUrl과 storagePath를 201로 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const body = {
      purpose: 'profile_image',
      fileName: 'photo.jpg',
      fileSize: 1024,
      mimeType: 'image/jpeg',
    };

    const res = await POST(makePostRequest(body));
    const resBody = (await res.json()) as {
      data: { signedUrl: string; storagePath: string };
    };

    expect(res.status).toBe(201);
    expect(resBody.data.signedUrl).toBe('/api/mock/upload');
    expect(resBody.data.storagePath).toBe('mock/profile_image/mock-file');
    expect(requireActiveUser).not.toHaveBeenCalled();
  });

  it('body 누락 시 400을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(true);

    const res = await POST(makePostRequest({}));
    const resBody = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(resBody.error.code).toBe('VALIDATION_ERROR');
  });

  it('purpose=profile_image이면 requireActiveUser를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(createFileUploadUrl).mockResolvedValue(mockUploadUrlResponse);

    const res = await POST(
      makePostRequest({
        purpose: 'profile_image',
        fileName: 'photo.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
      })
    );

    expect(res.status).toBe(201);
    expect(requireActiveUser).toHaveBeenCalledOnce();
    expect(createFileUploadUrl).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: 'profile_image' }),
      USER_ID,
      undefined
    );
  });

  it('purpose=seller_application_document이면 requireActiveUser + checkApplicationEligibility를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(checkApplicationEligibility).mockResolvedValue({
      eligible: true,
    });
    vi.mocked(createFileUploadUrl).mockResolvedValue(mockUploadUrlResponse);

    const res = await POST(
      makePostRequest({
        purpose: 'seller_application_document',
        fileName: 'doc.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf',
        documentType: 'business_license',
      })
    );

    expect(res.status).toBe(201);
    expect(requireActiveUser).toHaveBeenCalledOnce();
    expect(checkApplicationEligibility).toHaveBeenCalledWith(
      USER_ID,
      activeUserResult.serviceUser.role
    );
  });

  it('purpose=seller_application_document에서 eligibility 실패 시 409를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(checkApplicationEligibility).mockResolvedValue({
      eligible: false,
      reason: 'application_already_submitted',
    });

    const res = await POST(
      makePostRequest({
        purpose: 'seller_application_document',
        fileName: 'doc.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf',
        documentType: 'business_license',
      })
    );
    const resBody = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(resBody.error.code).toBe('APPLICATION_ALREADY_SUBMITTED');
  });

  it('purpose=store_image이면 requireSeller를 호출한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSeller).mockResolvedValue(sellerResult);
    vi.mocked(createFileUploadUrl).mockResolvedValue(mockUploadUrlResponse);

    const res = await POST(
      makePostRequest({
        purpose: 'store_image',
        fileName: 'store.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
      })
    );

    expect(res.status).toBe(201);
    expect(requireSeller).toHaveBeenCalledOnce();
  });

  it('purpose=seller_product_image이면 requireSellerStore를 호출하고 storeId를 service에 전달한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockResolvedValue(sellerStoreResult);
    vi.mocked(createFileUploadUrl).mockResolvedValue(mockUploadUrlResponse);

    const res = await POST(
      makePostRequest({
        purpose: 'seller_product_image',
        fileName: 'product.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
      })
    );

    expect(res.status).toBe(201);
    expect(requireSellerStore).toHaveBeenCalledOnce();
    expect(createFileUploadUrl).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: 'seller_product_image' }),
      USER_ID,
      STORE_ID
    );
  });

  it('purpose=store_image에서 requireSeller가 FORBIDDEN을 throw하면 403을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSeller).mockRejectedValue(
      new AppError(ERROR_CODE.FORBIDDEN, 403)
    );

    const res = await POST(
      makePostRequest({
        purpose: 'store_image',
        fileName: 'store.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
      })
    );
    const resBody = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(resBody.error.code).toBe('FORBIDDEN');
  });

  it('purpose=seller_product_image에서 requireSellerStore가 STORE_NOT_FOUND를 throw하면 404를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockRejectedValue(
      new AppError(ERROR_CODE.STORE_NOT_FOUND, 404)
    );

    const res = await POST(
      makePostRequest({
        purpose: 'seller_product_image',
        fileName: 'product.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
      })
    );
    const resBody = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(resBody.error.code).toBe('STORE_NOT_FOUND');
  });

  it('purpose=seller_product_image에서 requireSellerStore가 STORE_NOT_APPROVED를 throw하면 403을 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireSellerStore).mockRejectedValue(
      new AppError(ERROR_CODE.STORE_NOT_APPROVED, 403)
    );

    const res = await POST(
      makePostRequest({
        purpose: 'seller_product_image',
        fileName: 'product.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
      })
    );
    const resBody = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(resBody.error.code).toBe('STORE_NOT_APPROVED');
  });

  it('purpose=seller_application_document에서 eligibility reason이 seller_already_registered이면 409를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockResolvedValue(activeUserResult);
    vi.mocked(checkApplicationEligibility).mockResolvedValue({
      eligible: false,
      reason: 'seller_already_registered',
    });

    const res = await POST(
      makePostRequest({
        purpose: 'seller_application_document',
        fileName: 'doc.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf',
        documentType: 'business_license',
      })
    );
    const resBody = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(resBody.error.code).toBe('SELLER_ALREADY_REGISTERED');
  });

  it('requireActiveUser가 실패하면 error envelope를 반환한다', async () => {
    vi.mocked(isApiMockEnabled).mockReturnValue(false);
    vi.mocked(requireActiveUser).mockRejectedValue(
      new AppError(ERROR_CODE.UNAUTHORIZED, 401)
    );

    const res = await POST(
      makePostRequest({
        purpose: 'profile_image',
        fileName: 'photo.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
      })
    );
    const resBody = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(resBody.error.code).toBe('UNAUTHORIZED');
  });
});
