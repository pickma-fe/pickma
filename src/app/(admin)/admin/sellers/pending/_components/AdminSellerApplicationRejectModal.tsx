'use client';

import { useState, type FormEvent } from 'react';

import type { AdminPendingSellerApplicationResponse } from '@/contracts/admin';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';

interface AdminSellerApplicationRejectModalProps {
  application?: AdminPendingSellerApplicationResponse;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function AdminSellerApplicationRejectModal({
  application,
  isSubmitting,
  onClose,
  onSubmit,
}: AdminSellerApplicationRejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  function handleClose() {
    setReason('');
    setError('');
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedReason = reason.trim();

    if (trimmedReason.length < 5) {
      setError('거절 사유를 5자 이상 입력해주세요.');
      return;
    }

    onSubmit(trimmedReason);
  }

  return (
    <Modal
      isOpen={Boolean(application)}
      onClose={handleClose}
      title="판매자 신청 거절"
      size="md"
    >
      {application && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md bg-gray-50 p-4 text-sm">
            <p className="font-semibold text-gray-900">
              {application.companyName}
            </p>
            <p className="mt-1 text-gray-500">
              {application.representativeName} · {application.applicantEmail}
            </p>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">거절 사유</span>
            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError('');
              }}
              rows={5}
              className="focus:border-primary-500 focus:ring-primary-300 mt-2 w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2"
              placeholder="판매자에게 안내할 거절 사유를 입력해주세요."
              aria-describedby={error ? 'reject-reason-error' : undefined}
            />
          </label>
          {error && (
            <p id="reject-reason-error" className="text-sm text-red-500">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              color="gray"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" color="danger" disabled={isSubmitting}>
              거절 확정
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
