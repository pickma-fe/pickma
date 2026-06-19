import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { AdminPendingSellerApplication } from '@/types/seller-application';

import { AdminSellerApprovalTable } from './AdminSellerApprovalTable';

const application: AdminPendingSellerApplication = {
  id: 'application-1',
  userId: 'user-1',
  businessNumber: '123-45-67890',
  companyName: '픽마 베이커리',
  representativeName: '홍길동',
  businessAddress: '서울시 마포구 와우산로 1',
  businessType: '도소매업',
  businessCategory: '베이커리',
  documents: [],
  createdAt: new Date('2026-06-17T09:00:00.000Z'),
  updatedAt: new Date('2026-06-17T09:00:00.000Z'),
  applicantEmail: 'seller@example.com',
  applicantName: '홍길동',
  applicantPhone: '010-1234-5678',
  status: 'pending',
};

describe('AdminSellerApprovalTable', () => {
  it('상태 badge와 액션 버튼에 명확한 접근성 레이블을 제공한다', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();
    const onOpenDetail = vi.fn();

    render(
      <AdminSellerApprovalTable
        applications={[application]}
        isLoading={false}
        currentPage={1}
        totalPages={1}
        isActionPending={false}
        onPageChange={vi.fn()}
        onApprove={onApprove}
        onReject={onReject}
        onOpenDetail={onOpenDetail}
      />
    );

    expect(
      screen.getByRole('status', { name: '심사 상태: 검토 대기' })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: '픽마 베이커리 신청 승인 검토',
      })
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: '픽마 베이커리 신청 거절 검토',
      })
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: '픽마 베이커리 신청 상세 보기',
      })
    );

    expect(onApprove).toHaveBeenCalledWith(application);
    expect(onReject).toHaveBeenCalledWith(application);
    expect(onOpenDetail).toHaveBeenCalledWith(application);
  });
});
