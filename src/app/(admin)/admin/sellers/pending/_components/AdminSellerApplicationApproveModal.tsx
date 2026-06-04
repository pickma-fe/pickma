'use client';

import type { AdminPendingSellerApplicationResponse } from '@/contracts/admin';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';

interface AdminSellerApplicationApproveModalProps {
  application?: AdminPendingSellerApplicationResponse;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function AdminSellerApplicationApproveModal({
  application,
  isSubmitting,
  onClose,
  onSubmit,
}: AdminSellerApplicationApproveModalProps) {
  return (
    <Modal
      isOpen={Boolean(application)}
      onClose={onClose}
      title="판매자 신청 승인"
      size="md"
    >
      {application && (
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-md p-4 text-sm">
            <p className="font-semibold text-gray-900">
              {application.companyName}
            </p>
            <p className="mt-1 text-gray-600">
              {application.representativeName} · {application.applicantEmail}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            이 신청을 승인하면 해당 사용자는 판매자 온보딩을 완료하고 판매자
            권한을 사용할 수 있습니다.
          </p>
          <p className="text-sm font-medium text-gray-700">
            제출 문서와 신청 정보를 확인한 뒤 승인해주세요.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              color="gray"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
              승인 확정
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
