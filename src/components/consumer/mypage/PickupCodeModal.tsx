import type { ReactNode } from 'react';

import { Modal } from '@/components/common';

import type { MypageReservation } from './mypageReservationMapper';

interface PickupCodeModalProps {
  isOpen: boolean;
  reservation: MypageReservation;
  onClose: () => void;
}

export function PickupCodeModal({
  isOpen,
  reservation,
  onClose,
}: PickupCodeModalProps) {
  const reservationTitle = reservation.productName ?? reservation.storeName;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="픽업 코드 보기" size="sm">
      <div className="space-y-6">
        <div className="bg-primary-50 rounded-lg px-5 py-6 text-center">
          <p className="text-primary-500 text-sm font-semibold">픽업 코드</p>
          <p className="text-primary-600 mt-3 text-3xl font-black tracking-wide">
            {reservation.pickupCode}
          </p>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            매장 직원에게 이 화면을 보여주세요.
          </p>
        </div>

        <dl className="grid gap-3 text-sm">
          <PickupCodeInfoRow label="상품">{reservationTitle}</PickupCodeInfoRow>
          <PickupCodeInfoRow label="매장">
            {reservation.storeName}
          </PickupCodeInfoRow>
          <PickupCodeInfoRow label="픽업">
            {reservation.pickupDate} {reservation.pickupTime}
          </PickupCodeInfoRow>
        </dl>
      </div>
    </Modal>
  );
}

interface PickupCodeInfoRowProps {
  label: string;
  children: ReactNode;
}

function PickupCodeInfoRow({ label, children }: PickupCodeInfoRowProps) {
  return (
    <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-3">
      <dt className="font-semibold text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{children}</dd>
    </div>
  );
}
