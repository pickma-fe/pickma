import { describe, expect, it } from 'vitest';

import { createSellerApplicationSchema } from './schemas';

const VALID_DOCUMENTS = [
  {
    type: 'business_license' as const,
    storagePath: 'user-1/upload-1/business_license/file.pdf',
    originalFileName: 'license.pdf',
    contentType: 'application/pdf',
    size: 1024,
  },
  {
    type: 'food_service_permit' as const,
    storagePath: 'user-1/upload-2/food_service_permit/file.pdf',
    originalFileName: 'permit.pdf',
    contentType: 'application/pdf',
    size: 512,
  },
  {
    type: 'bank_account' as const,
    storagePath: 'user-1/upload-3/bank_account/file.png',
    originalFileName: 'bank.png',
    contentType: 'image/png',
    size: 2048,
  },
];

const VALID_BODY = {
  businessNumber: '123-45-67890',
  companyName: '테스트 주식회사',
  representativeName: '홍길동',
  businessAddress: '서울시 강남구',
  businessType: '소매업',
  businessCategory: '식품',
  documentConsentAgreed: true,
  documents: VALID_DOCUMENTS,
};

describe('createSellerApplicationSchema', () => {
  it('유효한 요청 파싱 성공', () => {
    const result = createSellerApplicationSchema.safeParse(VALID_BODY);
    expect(result.success).toBe(true);
  });

  it('documents가 3개 미만이면 실패', () => {
    const result = createSellerApplicationSchema.safeParse({
      ...VALID_BODY,
      documents: VALID_DOCUMENTS.slice(0, 2),
    });
    expect(result.success).toBe(false);
  });

  it('documents에 중복 타입이 있으면 실패', () => {
    const result = createSellerApplicationSchema.safeParse({
      ...VALID_BODY,
      documents: [...VALID_DOCUMENTS.slice(0, 2), { ...VALID_DOCUMENTS[0] }],
    });
    expect(result.success).toBe(false);
  });

  it('businessNumber가 없으면 실패', () => {
    const result = createSellerApplicationSchema.safeParse({
      ...VALID_BODY,
      businessNumber: '',
    });
    expect(result.success).toBe(false);
  });

  it('판매자 서류 수집·이용 동의가 true가 아니면 실패', () => {
    expect(
      createSellerApplicationSchema.safeParse({
        ...VALID_BODY,
        documentConsentAgreed: false,
      }).success
    ).toBe(false);
    expect(
      createSellerApplicationSchema.safeParse({
        ...VALID_BODY,
        documentConsentAgreed: undefined,
      }).success
    ).toBe(false);
  });

  it('알 수 없는 필드가 있으면 실패 (strict)', () => {
    const result = createSellerApplicationSchema.safeParse({
      ...VALID_BODY,
      unknownField: 'value',
    });
    expect(result.success).toBe(false);
  });
});
