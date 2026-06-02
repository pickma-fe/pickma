import { describe, expect, it } from 'vitest';

import {
  toAdminPendingSellerApplicationListResponse,
  toAdminPendingSellerApplicationResponse,
} from './mapper';

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

const USER_INFO = { email: 'test@example.com', name: '홍길동', phone: null };

describe('toAdminPendingSellerApplicationResponse', () => {
  it('DB row와 user 정보를 AdminPendingSellerApplicationResponse로 변환한다', () => {
    const result = toAdminPendingSellerApplicationResponse(
      APPLICATION_ROW,
      USER_INFO,
      []
    );
    expect(result).toMatchObject({
      id: 'app-1',
      userId: 'user-1',
      applicantEmail: 'test@example.com',
      applicantName: '홍길동',
      status: 'pending',
      businessNumber: '123-45-67890',
    });
  });

  it('phone이 null이면 applicantPhone을 포함하지 않는다', () => {
    const result = toAdminPendingSellerApplicationResponse(
      APPLICATION_ROW,
      USER_INFO,
      []
    );
    expect('applicantPhone' in result).toBe(false);
  });

  it('phone이 있으면 applicantPhone을 포함한다', () => {
    const result = toAdminPendingSellerApplicationResponse(
      APPLICATION_ROW,
      { ...USER_INFO, phone: '010-1234-5678' },
      []
    );
    expect(result.applicantPhone).toBe('010-1234-5678');
  });
});

describe('toAdminPendingSellerApplicationListResponse', () => {
  it('PaginatedResult 구조로 변환한다', () => {
    const item = toAdminPendingSellerApplicationResponse(
      APPLICATION_ROW,
      USER_INFO,
      []
    );
    const result = toAdminPendingSellerApplicationListResponse(
      [item],
      1,
      1,
      20
    );
    expect(result).toMatchObject({
      items: [item],
      totalCount: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  });
});
