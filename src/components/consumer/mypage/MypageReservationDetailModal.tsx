import type { ReactNode } from 'react';

import { Modal } from '@/components/common';

import type { MypageReservation } from './mypageReservationMapper';

interface MypageReservationDetailModalProps {
  isOpen: boolean;
  reservation: MypageReservation;
  onClose: () => void;
}

export function MypageReservationDetailModal({
  isOpen,
  reservation,
  onClose,
}: MypageReservationDetailModalProps) {
  const reservationTitle = reservation.productName ?? reservation.storeName;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="예약 상세보기" size="md">
      <div className="space-y-6">
        <div>
          <p className="text-primary-500 text-sm font-semibold">
            {reservation.storeName}
          </p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {reservationTitle}
          </h2>
        </div>

        <dl className="grid gap-4 text-sm">
          <ReservationDetailRow label="주문번호">
            {reservation.orderNumber}
          </ReservationDetailRow>
          <ReservationDetailRow label="픽업 날짜">
            {reservation.pickupDate}
          </ReservationDetailRow>
          <ReservationDetailRow label="픽업 시간">
            {reservation.pickupTime}
          </ReservationDetailRow>
          <ReservationDetailRow label="수량">
            {reservation.quantity ? `${reservation.quantity}개` : '확인 중'}
          </ReservationDetailRow>
          <ReservationDetailRow label="결제 금액">
            {reservation.price.toLocaleString()}원
          </ReservationDetailRow>
        </dl>
      </div>
    </Modal>
  );
}

interface ReservationDetailRowProps {
  label: string;
  children: ReactNode;
}

function ReservationDetailRow({ label, children }: ReservationDetailRowProps) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <dt className="font-semibold text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{children}</dd>
    </div>
  );
}
