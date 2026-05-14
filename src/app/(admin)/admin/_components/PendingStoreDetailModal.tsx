'use client';

import { useState } from 'react';

import type { Store } from '@/types/store';
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
  const [isSubmitting] = useState(false);
  const [errorMessage] = useState<string | null>(null);

  const handleClose = () => {
    setView('detail');
    setRejectReason('');
    onClose();
  };

  const handleCancel = () => {
    setView('detail');
    setRejectReason('');
  };

  if (!store) return null;

  return (
    <Modal isOpen={true} onClose={handleClose} title="가게 상세 정보" size="lg">
      <PendingStoreDetailContent
        store={store}
        view={view}
        rejectReason={rejectReason}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onClose={handleClose}
        onApproveClick={() => setView('approve-confirm')}
        onRejectClick={() => setView('reject-reason')}
        onApproveConfirm={() => {}}
        onRejectConfirm={() => {}}
        onCancel={handleCancel}
        onRejectReasonChange={setRejectReason}
      />
    </Modal>
  );
}
