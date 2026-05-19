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
    type: 'id_card' as const,
    storagePath: 'user-1/upload-2/id_card/file.jpg',
    originalFileName: 'id.jpg',
    contentType: 'image/jpeg',
    size: 512,
  },
  {
    type: 'bankbook' as const,
    storagePath: 'user-1/upload-3/bankbook/file.png',
    originalFileName: 'bank.png',
    contentType: 'image/png',
    size: 2048,
  },
  {
    type: 'business_report' as const,
    storagePath: 'user-1/upload-4/business_report/file.pdf',
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

describe('createSellerApplicationSchema', () => {
  it('유효한 요청 파싱 성공', () => {
    const result = createSellerApplicationSchema.safeParse(VALID_BODY);
    expect(result.success).toBe(true);
  });

  it('documents가 4개 미만이면 실패', () => {
    const result = createSellerApplicationSchema.safeParse({
      ...VALID_BODY,
      documents: VALID_DOCUMENTS.slice(0, 3),
    });
    expect(result.success).toBe(false);
  });

  it('documents에 중복 타입이 있으면 실패', () => {
    const result = createSellerApplicationSchema.safeParse({
      ...VALID_BODY,
      documents: [...VALID_DOCUMENTS.slice(0, 3), { ...VALID_DOCUMENTS[0] }],
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

  it('알 수 없는 필드가 있으면 실패 (strict)', () => {
    const result = createSellerApplicationSchema.safeParse({
      ...VALID_BODY,
      unknownField: 'value',
    });
    expect(result.success).toBe(false);
  });
});
