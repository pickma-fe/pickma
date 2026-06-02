import { describe, expect, it } from 'vitest';

import { toSellerApplicationResponse } from './mapper';

const APPLICATION_ROW = {
  id: 'app-1',
  user_id: 'user-1',
  status: 'pending' as const,
  business_number: '123-45-67890',
  company_name: '테스트 주식회사',
  representative_name: '홍길동',
  business_address: '서울시 강남구',
  business_type: '소매업',
  business_category: '식품',
  document_consent_agreed: true,
  document_consent_agreed_at: '2026-05-01T00:00:00Z',
  reject_reason: null,
  reviewed_at: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const DOCUMENT_ROW = {
  id: 'doc-1',
  application_id: 'app-1',
  type: 'business_license' as const,
  storage_path: 'user-1/upload-1/business_license/file.pdf',
  original_file_name: 'license.pdf',
  content_type: 'application/pdf',
  size: 1024,
  created_at: '2026-05-01T00:00:00Z',
};

describe('toSellerApplicationResponse', () => {
  it('DB row를 SellerApplicationResponse로 변환한다', () => {
    const result = toSellerApplicationResponse(APPLICATION_ROW, [DOCUMENT_ROW]);
    expect(result).toMatchObject({
      id: 'app-1',
      userId: 'user-1',
      status: 'pending',
      businessNumber: '123-45-67890',
      companyName: '테스트 주식회사',
      representativeName: '홍길동',
      businessAddress: '서울시 강남구',
      businessType: '소매업',
      businessCategory: '식품',
      documentConsentAgreed: true,
      documentConsentAgreedAt: '2026-05-01T00:00:00Z',
      createdAt: '2026-05-01T00:00:00Z',
      updatedAt: '2026-05-01T00:00:00Z',
    });
  });

  it('reject_reason이 null이면 rejectReason 필드를 포함하지 않는다', () => {
    const result = toSellerApplicationResponse(APPLICATION_ROW, []);
    expect('rejectReason' in result).toBe(false);
  });

  it('reject_reason이 있으면 rejectReason으로 변환한다', () => {
    const result = toSellerApplicationResponse(
      {
        ...APPLICATION_ROW,
        reject_reason: '서류 미비',
        reviewed_at: '2026-05-10T00:00:00Z',
      },
      []
    );
    expect(result.rejectReason).toBe('서류 미비');
    expect(result.reviewedAt).toBe('2026-05-10T00:00:00Z');
  });

  it('documents를 변환한다', () => {
    const result = toSellerApplicationResponse(APPLICATION_ROW, [DOCUMENT_ROW]);
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0]).toMatchObject({
      id: 'doc-1',
      applicationId: 'app-1',
      type: 'business_license',
      storagePath: 'user-1/upload-1/business_license/file.pdf',
    });
  });
});
