'use client';

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';

interface OrderCancelModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function OrderCancelModal({
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: OrderCancelModalProps) {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      onClose();
    }
  };

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="주문 취소"
      size="md"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          주문을 취소하면 결제가 환불됩니다. 취소 사유를 입력해주세요.
        </p>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="cancel-reason"
            className="text-sm font-medium text-gray-700"
          >
            취소 사유 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            placeholder="취소 사유를 입력해주세요 (최대 500자)"
            maxLength={500}
            rows={4}
            className="focus:border-primary-500 focus:ring-primary-500 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
          />
          <p className="text-right text-xs text-gray-400">
            {reason.length}/500
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            color="gray"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            color="danger"
            onClick={handleConfirm}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1"
          >
            {isSubmitting ? '취소 처리 중...' : '주문 취소 확인'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
