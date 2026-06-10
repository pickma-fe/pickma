'use client';

import type { AdminPendingSellerApplication } from '@/types/seller-application';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';

import { formatAdminDateTime } from './adminSellerApprovalUtils';

interface AdminSellerApprovalTableProps {
  applications: AdminPendingSellerApplication[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  isActionPending: boolean;
  pendingActionId?: string;
  onPageChange: (page: number) => void;
  onApprove: (application: AdminPendingSellerApplication) => void;
  onReject: (application: AdminPendingSellerApplication) => void;
  onOpenDetail: (application: AdminPendingSellerApplication) => void;
}

export function AdminSellerApprovalTable({
  applications,
  isLoading,
  currentPage,
  totalPages,
  isActionPending,
  pendingActionId,
  onPageChange,
  onApprove,
  onReject,
  onOpenDetail,
}: AdminSellerApprovalTableProps) {
  return (
    <AdminTable
      data={applications}
      rowKey={(application) => application.id}
      isLoading={isLoading}
      emptyMessage="검토 대기 중인 판매자 신청이 없습니다."
      pagination={{
        currentPage,
        totalPages,
        onPageChange,
      }}
      columns={[
        {
          key: 'createdAt',
          header: '신청일',
          render: (application) => (
            <span className="text-gray-600">
              {formatAdminDateTime(application.createdAt)}
            </span>
          ),
        },
        {
          key: 'company',
          header: '상호명',
          render: (application) => (
            <div className="min-w-44">
              <p className="font-semibold text-gray-900">
                {application.companyName}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                사업자 {application.businessNumber}
              </p>
            </div>
          ),
        },
        {
          key: 'representative',
          header: '대표자명',
          render: (application) => application.representativeName,
        },
        {
          key: 'category',
          header: '업종',
          render: (application) => application.businessCategory,
        },
        {
          key: 'phone',
          header: '연락처',
          render: (application) => application.applicantPhone ?? '-',
        },
        {
          key: 'email',
          header: '이메일',
          render: (application) => (
            <span className="text-gray-600">{application.applicantEmail}</span>
          ),
        },
        {
          key: 'status',
          header: '상태',
          render: () => (
            <Badge color="warning" rounded="md">
              검토 대기
            </Badge>
          ),
        },
        {
          key: 'actions',
          header: '관리',
          headerAlign: 'center',
          align: 'center',
          render: (application) => {
            const isPending = pendingActionId === application.id;
            const isActionDisabled = isActionPending || isPending;

            return (
              <div className="flex justify-center gap-2">
                <Button
                  className="h-8 px-3 text-xs"
                  disabled={isActionDisabled}
                  onClick={() => onApprove(application)}
                >
                  승인
                </Button>
                <Button
                  variant="outline"
                  color="gray"
                  className="h-8 px-3 text-xs"
                  disabled={isActionDisabled}
                  onClick={() => onReject(application)}
                >
                  거절
                </Button>
                <Button
                  variant="outline"
                  color="gray"
                  className="h-8 px-3 text-xs"
                  onClick={() => onOpenDetail(application)}
                >
                  상세
                </Button>
              </div>
            );
          },
        },
      ]}
    />
  );
}
