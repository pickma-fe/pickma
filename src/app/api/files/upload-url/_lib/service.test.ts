import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { createFileUploadUrl } from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const mockCreateSignedUploadUrl = vi.fn();

function setupStorageMock(signedUrl = 'https://storage.example.com/upload') {
  vi.mocked(createServiceRoleClient).mockReturnValue({
    storage: {
      from: vi.fn().mockReturnValue({
        createSignedUploadUrl: mockCreateSignedUploadUrl.mockResolvedValue({
          data: { signedUrl, path: '' },
          error: null,
        }),
      }),
    },
  } as unknown as ReturnType<typeof createServiceRoleClient>);
}

const USER_ID = 'user-00000000-0000-4000-8000-000000000001';

describe('createFileUploadUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStorageMock();
  });

  describe('purpose별 bucket 라우팅', () => {
    it('profile_image → profile-images bucket', async () => {
      await createFileUploadUrl(
        {
          purpose: 'profile_image',
          fileName: 'avatar.png',
          fileSize: 1024,
          mimeType: 'image/png',
        },
        USER_ID
      );
      expect(
        vi.mocked(createServiceRoleClient)().storage.from
      ).toHaveBeenCalledWith('profile-images');
    });

    it('store_image → store-images bucket', async () => {
      await createFileUploadUrl(
        {
          purpose: 'store_image',
          fileName: 'store.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
        },
        USER_ID
      );
      expect(
        vi.mocked(createServiceRoleClient)().storage.from
      ).toHaveBeenCalledWith('store-images');
    });

    it('seller_product_image → product-images bucket', async () => {
      await createFileUploadUrl(
        {
          purpose: 'seller_product_image',
          fileName: 'product.png',
          fileSize: 1024,
          mimeType: 'image/png',
        },
        USER_ID
      );
      expect(
        vi.mocked(createServiceRoleClient)().storage.from
      ).toHaveBeenCalledWith('product-images');
    });

    it('seller_application_document → seller-application-documents bucket', async () => {
      await createFileUploadUrl(
        {
          purpose: 'seller_application_document',
          fileName: 'license.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          documentType: 'business_license',
        },
        USER_ID
      );
      expect(
        vi.mocked(createServiceRoleClient)().storage.from
      ).toHaveBeenCalledWith('seller-application-documents');
    });
  });

  describe('storage path prefix', () => {
    it('profile_image path는 userId로 시작한다', async () => {
      const result = await createFileUploadUrl(
        {
          purpose: 'profile_image',
          fileName: 'photo.png',
          fileSize: 1024,
          mimeType: 'image/png',
        },
        USER_ID
      );
      expect(result.storagePath).toMatch(new RegExp(`^${USER_ID}/`));
    });

    it('seller_application_document path에 documentType 포함', async () => {
      const result = await createFileUploadUrl(
        {
          purpose: 'seller_application_document',
          fileName: 'doc.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          documentType: 'food_service_permit',
        },
        USER_ID
      );
      expect(result.storagePath).toContain('/food_service_permit/');
    });

    it('seller_product_image에 storeId 주입 시 path prefix로 사용', async () => {
      const storeId = 'store-00000000-0000-4000-8000-000000000002';
      const result = await createFileUploadUrl(
        {
          purpose: 'seller_product_image',
          fileName: 'item.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
        },
        USER_ID,
        storeId
      );
      expect(result.storagePath).toMatch(new RegExp(`^${storeId}/`));
    });

    it('seller_product_image에 storeId 없으면 userId로 폴백', async () => {
      const result = await createFileUploadUrl(
        {
          purpose: 'seller_product_image',
          fileName: 'item.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
        },
        USER_ID
      );
      expect(result.storagePath).toMatch(new RegExp(`^${USER_ID}/`));
    });

    it('fileName 특수문자를 언더스코어로 치환', async () => {
      const result = await createFileUploadUrl(
        {
          purpose: 'profile_image',
          fileName: '사진 파일 (1).png',
          fileSize: 1024,
          mimeType: 'image/png',
        },
        USER_ID
      );
      expect(result.storagePath).not.toMatch(/[^\w\-./]/);
    });
  });

  describe('MIME 타입 정책', () => {
    it('허용되지 않는 MIME → FILE_TYPE_NOT_ALLOWED', async () => {
      await expect(
        createFileUploadUrl(
          {
            purpose: 'profile_image',
            fileName: 'photo.gif',
            fileSize: 1024,
            mimeType: 'image/gif',
          },
          USER_ID
        )
      ).rejects.toSatisfy(
        (e: unknown) =>
          e instanceof AppError && e.code === ERROR_CODE.FILE_TYPE_NOT_ALLOWED
      );
    });

    it('seller_application_document는 PDF 허용', async () => {
      await expect(
        createFileUploadUrl(
          {
            purpose: 'seller_application_document',
            fileName: 'doc.pdf',
            fileSize: 1024,
            mimeType: 'application/pdf',
            documentType: 'bank_account',
          },
          USER_ID
        )
      ).resolves.toBeDefined();
    });

    it('이미지 전용 bucket에 PDF → FILE_TYPE_NOT_ALLOWED', async () => {
      await expect(
        createFileUploadUrl(
          {
            purpose: 'store_image',
            fileName: 'doc.pdf',
            fileSize: 1024,
            mimeType: 'application/pdf',
          },
          USER_ID
        )
      ).rejects.toSatisfy(
        (e: unknown) =>
          e instanceof AppError && e.code === ERROR_CODE.FILE_TYPE_NOT_ALLOWED
      );
    });
  });

  describe('파일 크기 정책', () => {
    it('profile_image 3MB 초과 → FILE_TOO_LARGE', async () => {
      await expect(
        createFileUploadUrl(
          {
            purpose: 'profile_image',
            fileName: 'big.png',
            fileSize: 3 * 1024 * 1024 + 1,
            mimeType: 'image/png',
          },
          USER_ID
        )
      ).rejects.toSatisfy(
        (e: unknown) =>
          e instanceof AppError && e.code === ERROR_CODE.FILE_TOO_LARGE
      );
    });

    it('store_image 5MB 이하는 허용', async () => {
      await expect(
        createFileUploadUrl(
          {
            purpose: 'store_image',
            fileName: 'store.jpg',
            fileSize: 5 * 1024 * 1024,
            mimeType: 'image/jpeg',
          },
          USER_ID
        )
      ).resolves.toBeDefined();
    });

    it('seller_application_document 10MB 초과 → FILE_TOO_LARGE', async () => {
      await expect(
        createFileUploadUrl(
          {
            purpose: 'seller_application_document',
            fileName: 'large.pdf',
            fileSize: 10 * 1024 * 1024 + 1,
            mimeType: 'application/pdf',
            documentType: 'bank_account',
          },
          USER_ID
        )
      ).rejects.toSatisfy(
        (e: unknown) =>
          e instanceof AppError && e.code === ERROR_CODE.FILE_TOO_LARGE
      );
    });
  });

  describe('Supabase storage 오류', () => {
    it('createSignedUploadUrl 오류 → INTERNAL_SERVER_ERROR', async () => {
      mockCreateSignedUploadUrl.mockResolvedValue({
        data: null,
        error: { message: 'bucket not found' },
      });

      await expect(
        createFileUploadUrl(
          {
            purpose: 'profile_image',
            fileName: 'photo.png',
            fileSize: 1024,
            mimeType: 'image/png',
          },
          USER_ID
        )
      ).rejects.toSatisfy(
        (e: unknown) =>
          e instanceof AppError && e.code === ERROR_CODE.INTERNAL_SERVER_ERROR
      );
    });
  });
});
