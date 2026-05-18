import Image from 'next/image';

import type { OrderStatus } from '@/types/order';
import { Button } from '@/components/common';

import type { MypageReservation } from './mypageReservationMapper';

interface MypageReservationCardProps {
  reservation: MypageReservation;
}

type ReservationStatusGroup = 'pendingPickup' | 'completed' | 'cancelled';
type ReservationDisplayGroup =
  | 'paymentPending'
  | 'pendingPickup'
  | 'completed'
  | 'cancelled';

const statusGroupMap: Record<OrderStatus, ReservationStatusGroup> = {
  paymentPending: 'pendingPickup',
  processing: 'pendingPickup',
  reserved: 'pendingPickup',
  ready: 'pendingPickup',
  completed: 'completed',
  cancelled: 'cancelled',
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
  const statusGroup = statusGroupMap[reservation.status];
  const displayGroup =
    reservation.status === 'paymentPending' ? 'paymentPending' : statusGroup;
  const status = statusStyles[displayGroup];
  const reservationTitle = reservation.productName
    ? `${reservation.storeName} ${reservation.productName}`
    : reservation.storeName;

  return (
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
          {!reservation.productName ? (
            <p className="mt-2 text-sm text-gray-500">
              상품 정보는 예약 상세에서 확인할 수 있습니다.
            </p>
          ) : null}
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
            disabled
            className="h-12 min-w-32 px-5 text-sm"
          >
            예약 상세보기
          </Button>
          <Button
            variant={status.actionVariant}
            color={
              displayGroup === 'pendingPickup' ||
              displayGroup === 'paymentPending'
                ? 'primary'
                : 'gray'
            }
            disabled
            className="h-12 min-w-32 px-5 text-sm"
          >
            {status.actionLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
