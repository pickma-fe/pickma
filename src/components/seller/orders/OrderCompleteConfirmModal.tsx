'use client';

import { Hash } from 'lucide-react';

import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';

interface OrderCompleteConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  pickupNumber: string | null;
  storeOrderNumber: string | null;
  orderNumber: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function OrderCompleteConfirmModal({
  isOpen,
  isSubmitting,
  pickupNumber,
  storeOrderNumber,
  orderNumber,
  onClose,
  onConfirm,
}: OrderCompleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="픽업 완료 확인"
      size="sm"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          픽업 번호를 확인한 뒤 완료 처리해주세요.
        </p>

        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          {pickupNumber !== null && (
            <div className="mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">픽업 번호</span>
              <span className="text-2xl font-bold text-gray-900">
                {pickupNumber}
              </span>
            </div>
          )}
          {storeOrderNumber !== null && (
            <p className="text-xs text-gray-400">
              가게 주문번호: {storeOrderNumber}
            </p>
          )}
          <p className="text-xs text-gray-400">주문번호: {orderNumber}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            color="gray"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? '처리 중...' : '픽업 완료'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
