import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';

import { createSellerApplication } from './service';

vi.mock('@/lib/supabase/service', () => ({
  createServiceRoleClient: vi.fn(),
}));

const USER_ID = 'user-00000000-0000-4000-8000-000000000001';

const VALID_DOCUMENTS = [
  {
    type: 'business_license' as const,
    storagePath: `${USER_ID}/upload-1/business_license/license.pdf`,
    originalFileName: 'license.pdf',
    contentType: 'application/pdf',
    size: 1024,
  },
  {
    type: 'id_card' as const,
    storagePath: `${USER_ID}/upload-2/id_card/id.jpg`,
    originalFileName: 'id.jpg',
    contentType: 'image/jpeg',
    size: 512,
  },
  {
    type: 'bankbook' as const,
    storagePath: `${USER_ID}/upload-3/bankbook/bank.png`,
    originalFileName: 'bank.png',
    contentType: 'image/png',
    size: 2048,
  },
  {
    type: 'business_report' as const,
    storagePath: `${USER_ID}/upload-4/business_report/report.pdf`,
    originalFileName: 'report.pdf',
    contentType: 'application/pdf',
    size: 4096,
  },
];

const VALID_BODY = {
  businessNumber: '123-45-67890',
  companyName: '테스트 주식회사',
  representativeName: '홍길동',
  businessAddress: '서울시 강남구',
  businessType: '소매업',
  businessCategory: '식품',
  documents: VALID_DOCUMENTS,
};

const MOCK_APPLICATION = {
  id: 'app-1',
  user_id: USER_ID,
  status: 'pending' as const,
  business_number: VALID_BODY.businessNumber,
  company_name: VALID_BODY.companyName,
  representative_name: VALID_BODY.representativeName,
  business_address: VALID_BODY.businessAddress,
  business_type: VALID_BODY.businessType,
  business_category: VALID_BODY.businessCategory,
  reject_reason: null,
  reviewed_at: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const MOCK_DOCUMENTS = VALID_DOCUMENTS.map((doc, i) => ({
  id: `doc-${i + 1}`,
  application_id: 'app-1',
  type: doc.type,
  storage_path: doc.storagePath,
  original_file_name: doc.originalFileName,
  content_type: doc.contentType,
  size: doc.size,
  created_at: '2026-05-01T00:00:00Z',
}));

function buildStorageMock(fileExists = true) {
  return {
    storage: {
      from: vi.fn().mockReturnValue({
        list: vi.fn().mockResolvedValue({
          data: fileExists ? [{ name: 'file.pdf' }] : [],
          error: null,
        }),
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'seller_applications') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: MOCK_APPLICATION,
                error: null,
              }),
            }),
          }),
        };
      }
      // seller_application_documents
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: MOCK_DOCUMENTS,
            error: null,
          }),
        }),
      };
    }),
  };
}

describe('createSellerApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('유효한 요청이면 신청을 생성하고 반환한다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildStorageMock() as unknown as ReturnType<
        typeof createServiceRoleClient
      >
    );

    const result = await createSellerApplication(USER_ID, VALID_BODY);
    expect(result.id).toBe('app-1');
    expect(result.status).toBe('pending');
    expect(result.documents).toHaveLength(4);
  });

  it('문서 타입이 중복이면 VALIDATION_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildStorageMock() as unknown as ReturnType<
        typeof createServiceRoleClient
      >
    );

    await expect(
      createSellerApplication(USER_ID, {
        ...VALID_BODY,
        documents: [...VALID_DOCUMENTS.slice(0, 3), { ...VALID_DOCUMENTS[0] }],
      })
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.VALIDATION_ERROR
    );
  });

  it('path의 userId segment가 다르면 VALIDATION_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildStorageMock() as unknown as ReturnType<
        typeof createServiceRoleClient
      >
    );

    const otherUser = 'other-user-000000-0000-4000-8000-000000000002';
    await expect(
      createSellerApplication(USER_ID, {
        ...VALID_BODY,
        documents: [
          {
            ...VALID_DOCUMENTS[0],
            storagePath: `${otherUser}/upload-1/business_license/license.pdf`,
          },
          ...VALID_DOCUMENTS.slice(1),
        ],
      })
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.VALIDATION_ERROR
    );
  });

  it('path의 type segment가 document.type과 다르면 VALIDATION_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildStorageMock() as unknown as ReturnType<
        typeof createServiceRoleClient
      >
    );

    await expect(
      createSellerApplication(USER_ID, {
        ...VALID_BODY,
        documents: [
          {
            ...VALID_DOCUMENTS[0],
            storagePath: `${USER_ID}/upload-1/id_card/license.pdf`,
          },
          ...VALID_DOCUMENTS.slice(1),
        ],
      })
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.VALIDATION_ERROR
    );
  });

  it('Storage object가 존재하지 않으면 VALIDATION_ERROR를 던진다', async () => {
    vi.mocked(createServiceRoleClient).mockReturnValue(
      buildStorageMock(false) as unknown as ReturnType<
        typeof createServiceRoleClient
      >
    );

    await expect(
      createSellerApplication(USER_ID, VALID_BODY)
    ).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof AppError && e.code === ERROR_CODE.VALIDATION_ERROR
    );
  });
});
