import { describe, expect, it } from 'vitest';

import { createFileUploadUrlSchema } from './schemas';

const baseValid = {
  purpose: 'profile_image' as const,
  fileName: 'photo.png',
  fileSize: 1024 * 1024,
  mimeType: 'image/png',
};

describe('createFileUploadUrlSchema', () => {
  describe('seller_application_document', () => {
    it('documentType 없으면 실패', () => {
      const result = createFileUploadUrlSchema.safeParse({
        ...baseValid,
        purpose: 'seller_application_document',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('documentType');
      }
    });

    it('documentType 있으면 통과', () => {
      const result = createFileUploadUrlSchema.safeParse({
        ...baseValid,
        purpose: 'seller_application_document',
        documentType: 'business_license',
      });
      expect(result.success).toBe(true);
    });

    it('잘못된 documentType 값은 실패', () => {
      const result = createFileUploadUrlSchema.safeParse({
        ...baseValid,
        purpose: 'seller_application_document',
        documentType: 'invalid_type',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('다른 purpose', () => {
    it('documentType 없어도 통과 (profile_image)', () => {
      expect(createFileUploadUrlSchema.safeParse(baseValid).success).toBe(true);
    });

    it('documentType 없어도 통과 (store_image)', () => {
      const result = createFileUploadUrlSchema.safeParse({
        ...baseValid,
        purpose: 'store_image',
      });
      expect(result.success).toBe(true);
    });

    it('documentType 없어도 통과 (seller_product_image)', () => {
      const result = createFileUploadUrlSchema.safeParse({
        ...baseValid,
        purpose: 'seller_product_image',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('공통 필드 검증', () => {
    it('purpose 값이 없으면 실패', () => {
      const noPurpose = {
        fileName: baseValid.fileName,
        fileSize: baseValid.fileSize,
        mimeType: baseValid.mimeType,
      };
      expect(createFileUploadUrlSchema.safeParse(noPurpose).success).toBe(
        false
      );
    });

    it('fileName이 빈 문자열이면 실패', () => {
      const result = createFileUploadUrlSchema.safeParse({
        ...baseValid,
        fileName: '',
      });
      expect(result.success).toBe(false);
    });

    it('fileSize가 0이면 실패', () => {
      const result = createFileUploadUrlSchema.safeParse({
        ...baseValid,
        fileSize: 0,
      });
      expect(result.success).toBe(false);
    });

    it('알 수 없는 필드를 거부한다', () => {
      const result = createFileUploadUrlSchema.safeParse({
        ...baseValid,
        unknownField: 'value',
      });
      expect(result.success).toBe(false);
    });
  });
});
