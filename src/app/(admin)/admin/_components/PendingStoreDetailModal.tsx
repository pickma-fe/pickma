'use client';

import { useState } from 'react';

import type { Store } from '@/types/store';
import { useApproveStore } from '@/hooks/admin/stores/useApproveStore';
import { useRejectStore } from '@/hooks/admin/stores/useRejectStore';
import { Modal } from '@/components/common/Modal/Modal';

import {
  PendingStoreDetailContent,
  type DetailView,
} from './PendingStoreDetailContent';

interface PendingStoreDetailModalProps {
  store: Store | null;
  onClose: () => void;
}

export function PendingStoreDetailModal({
  store,
  onClose,
}: PendingStoreDetailModalProps) {
  const [view, setView] = useState<DetailView>('detail');
  const [rejectReason, setRejectReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const approveStore = useApproveStore();
  const rejectStore = useRejectStore();

  const isSubmitting = approveStore.isPending || rejectStore.isPending;

  const resetAndClose = () => {
    setView('detail');
    setRejectReason('');
    setErrorMessage(null);
    onClose();
  };

  const handleCancel = () => {
    setView('detail');
    setRejectReason('');
    setErrorMessage(null);
  };

  const handleApproveConfirm = () => {
    if (!store) return;
    setErrorMessage(null);
    approveStore.mutate(store.id, {
      onSuccess: resetAndClose,
      onError: () => setErrorMessage('승인 처리 중 오류가 발생했습니다.'),
    });
  };

  const handleRejectConfirm = () => {
    if (!store || rejectReason.trim() === '') return;
    setErrorMessage(null);
    rejectStore.mutate(
      { id: store.id, reason: rejectReason.trim() },
      {
        onSuccess: resetAndClose,
        onError: () => setErrorMessage('거절 처리 중 오류가 발생했습니다.'),
      }
    );
  };

  if (!store) return null;

  return (
    <Modal
      isOpen={true}
      onClose={resetAndClose}
      title="가게 상세 정보"
      size="lg"
    >
      <PendingStoreDetailContent
        store={store}
        view={view}
        rejectReason={rejectReason}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onClose={resetAndClose}
        onApproveClick={() => setView('approve-confirm')}
        onRejectClick={() => setView('reject-reason')}
        onApproveConfirm={handleApproveConfirm}
        onRejectConfirm={handleRejectConfirm}
        onCancel={handleCancel}
        onRejectReasonChange={setRejectReason}
      />
    </Modal>
  );
}
