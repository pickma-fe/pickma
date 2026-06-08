'use client';

import Image from 'next/image';
import { useState } from 'react';

import type { OrderStatus } from '@/types/order';
import { usePayment } from '@/hooks/payments/usePayment';
import { Button } from '@/components/common';

import { MypageReservationDetailModal } from './MypageReservationDetailModal';
import type { MypageReservation } from './mypageReservationMapper';
import { PickupCodeModal } from './PickupCodeModal';

interface MypageReservationCardProps {
  reservation: MypageReservation;
}

type ReservationDisplayGroup =
  | 'paymentPending'
  | 'processing'
  | 'pendingPickup'
  | 'completed'
  | 'cancelling'
  | 'cancelled';

const statusDisplayMap: Record<OrderStatus, ReservationDisplayGroup> = {
  paymentPending: 'paymentPending',
  processing: 'processing',
  reserved: 'pendingPickup',
  accepted: 'pendingPickup',
  ready: 'pendingPickup',
  completed: 'completed',
  cancelled: 'cancelled',
  cancelling: 'cancelling',
  noShow: 'cancelled',
  expired: 'cancelled',
};

const statusStyles: Record<
  ReservationDisplayGroup,
  {
    label: string;
    className: string;
    actionLabel: string;
    actionVariant: 'filled' | 'outline';
  }
> = {
  paymentPending: {
    label: '결제 대기',
    className: 'bg-yellow-50 text-yellow-600',
    actionLabel: '결제하기',
    actionVariant: 'filled',
  },
  processing: {
    label: '처리 중',
    className: 'bg-yellow-50 text-yellow-600',
    actionLabel: '처리 중',
    actionVariant: 'outline',
  },
  pendingPickup: {
    label: '픽업 대기',
    className: 'bg-primary-50 text-primary-500',
    actionLabel: '픽업 코드 보기',
    actionVariant: 'filled',
  },
  completed: {
    label: '픽업 완료',
    className: 'bg-primary-50 text-primary-500',
    actionLabel: '다시 예약',
    actionVariant: 'outline',
  },
  cancelling: {
    label: '취소 처리 중',
    className: 'bg-orange-50 text-orange-500',
    actionLabel: '내역 보기',
    actionVariant: 'outline',
  },
  cancelled: {
    label: '취소/환불',
    className: 'bg-gray-100 text-gray-500',
    actionLabel: '내역 보기',
    actionVariant: 'outline',
  },
};

export function MypageReservationCard({
  reservation,
}: MypageReservationCardProps) {
  const { openPayment, isPending: isPaymentPending } = usePayment();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPickupCodeModalOpen, setIsPickupCodeModalOpen] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');
  const displayGroup = statusDisplayMap[reservation.status];
  const status = statusStyles[displayGroup];
  const isPickupCodeAvailable =
    displayGroup === 'pendingPickup' && Boolean(reservation.pickupCode);
  const shouldShowPickupCodeButton = displayGroup === 'pendingPickup';
  const shouldShowPaymentButton = displayGroup === 'paymentPending';
  const reservationTitle = reservation.productName
    ? `${reservation.storeName} ${reservation.productName}`
    : reservation.storeName;

  const handleOpenDetailModal = () => {
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const handleOpenPickupCodeModal = () => {
    if (!isPickupCodeAvailable) {
      return;
    }

    setIsPickupCodeModalOpen(true);
  };

  const handleClosePickupCodeModal = () => {
    setIsPickupCodeModalOpen(false);
  };

  const handleOpenPayment = async () => {
    setPaymentErrorMessage('');

    try {
      await openPayment({
        orderNumber: reservation.orderNumber,
        orderName: reservationTitle,
      });
    } catch {
      setPaymentErrorMessage('결제를 시작하지 못했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <>
      <article className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="grid gap-12 md:grid-cols-[150px_minmax(0,1fr)_120px_240px] md:items-center">
          <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
            <Image
              src={reservation.imageUrl}
              alt={reservationTitle}
              fill
              sizes="150px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <span
              className={[
                'inline-flex rounded-sm px-3 py-1 text-xs font-bold',
                status.className,
              ].join(' ')}
            >
              {status.label}
            </span>
            <p className="mt-4 text-xl font-bold text-gray-900">
              {reservationTitle}
            </p>
            <dl className="mt-4 grid gap-2 text-base md:grid-cols-[72px_minmax(0,1fr)]">
              <dt className="text-gray-500">픽업 날짜</dt>
              <dd className="text-gray-700">
                {reservation.pickupDate} &nbsp; {reservation.pickupTime}
              </dd>
              <dt className="text-gray-500">주문번호</dt>
              <dd className="text-gray-700">{reservation.orderNumber}</dd>
            </dl>
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-900">
              {reservation.price.toLocaleString()}원
            </p>
            {reservation.quantity ? (
              <p className="mt-2 text-base text-gray-500">
                수량&nbsp; {reservation.quantity}개
              </p>
            ) : null}
          </div>

          <div className="flex gap-2 md:justify-end">
            <Button
              variant="outline"
              color="gray"
              className="h-12 min-w-32 px-5 text-sm"
              onClick={handleOpenDetailModal}
            >
              예약 상세보기
            </Button>
            {shouldShowPickupCodeButton ? (
              <Button
                variant={status.actionVariant}
                color="primary"
                disabled={!isPickupCodeAvailable}
                className="h-12 min-w-32 px-5 text-sm"
                onClick={handleOpenPickupCodeModal}
              >
                {reservation.pickupCode
                  ? '픽업 코드 보기'
                  : '픽업 코드 발급 전'}
              </Button>
            ) : null}
            {shouldShowPaymentButton ? (
              <Button
                color="primary"
                disabled={isPaymentPending}
                className="h-12 min-w-32 px-5 text-sm"
                onClick={handleOpenPayment}
              >
                {isPaymentPending ? '결제 준비 중' : '결제하기'}
              </Button>
            ) : null}
          </div>
        </div>
        {paymentErrorMessage ? (
          <p role="alert" className="mt-3 text-right text-sm text-red-500">
            {paymentErrorMessage}
          </p>
        ) : null}
      </article>

      <MypageReservationDetailModal
        isOpen={isDetailModalOpen}
        reservation={reservation}
        onClose={handleCloseDetailModal}
      />
      {reservation.pickupCode ? (
        <PickupCodeModal
          isOpen={isPickupCodeModalOpen}
          reservation={reservation}
          onClose={handleClosePickupCodeModal}
        />
      ) : null}
    </>
  );
}
