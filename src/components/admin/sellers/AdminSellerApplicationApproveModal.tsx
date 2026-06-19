'use client';

import type { AdminPendingSellerApplication } from '@/types/seller-application';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';

interface AdminSellerApplicationApproveModalProps {
  application?: AdminPendingSellerApplication;
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
          <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            제출 문서, 신청 정보, 사업자 정보를 검토한 뒤 승인해 주세요. 승인
            후에는 판매자 기능 접근이 바로 가능해집니다.
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              color="gray"
              className="h-11 px-4"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="button"
              className="h-11 px-4"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              승인 확정
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
