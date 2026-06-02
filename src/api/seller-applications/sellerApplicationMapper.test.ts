import { describe, expect, it } from 'vitest';

import type { SellerApplicationResponse } from '@/contracts/seller-application';

import { mapSellerApplication } from './sellerApplicationMapper';

const MOCK_RESPONSE: SellerApplicationResponse = {
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
  documents: [
    {
      id: 'doc-1',
      applicationId: 'app-1',
      type: 'business_license',
      storagePath: 'user-1/upload-1/business_license/file.pdf',
      originalFileName: 'license.pdf',
      contentType: 'application/pdf',
      size: 1024,
      createdAt: '2026-05-01T00:00:00Z',
    },
  ],
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-02T00:00:00Z',
};

describe('mapSellerApplication', () => {
  it('ISO 날짜 문자열을 Date로 변환한다', () => {
    const result = mapSellerApplication(MOCK_RESPONSE);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.documents[0]?.createdAt).toBeInstanceOf(Date);
    expect(result.documentConsentAgreedAt).toBeInstanceOf(Date);
  });

  it('rejectReason이 없으면 해당 필드를 포함하지 않는다', () => {
    const result = mapSellerApplication(MOCK_RESPONSE);
    expect('rejectReason' in result).toBe(false);
  });

  it('rejectReason이 있으면 포함한다', () => {
    const result = mapSellerApplication({
      ...MOCK_RESPONSE,
      rejectReason: '서류 미비',
      reviewedAt: '2026-05-10T00:00:00Z',
    });
    expect(result.rejectReason).toBe('서류 미비');
    expect(result.reviewedAt).toBeInstanceOf(Date);
  });

  it('documents를 변환한다', () => {
    const result = mapSellerApplication(MOCK_RESPONSE);
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0]?.type).toBe('business_license');
  });
});
