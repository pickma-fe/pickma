import { MoreVertical } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/common';
import type { MockMypageReservation } from '@/mocks/mypage';

interface MypageReservationCardProps {
  reservation: MockMypageReservation;
}

type ReservationStatusGroup = 'pendingPickup' | 'completed' | 'cancelled';

const statusGroupMap: Record<
  MockMypageReservation['status'],
  ReservationStatusGroup
> = {
  reserved: 'pendingPickup',
  ready: 'pendingPickup',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'cancelled',
  expired: 'cancelled',
};

const statusStyles: Record<
  ReservationStatusGroup,
  {
    label: string;
    className: string;
    actionLabel: string;
    actionVariant: 'filled' | 'outline';
  }
> = {
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
  const status = statusStyles[statusGroup];

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="grid gap-5 md:grid-cols-[150px_minmax(0,1fr)_120px_240px_24px] md:items-center">
        <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
          <Image
            src={reservation.imageUrl}
            alt={reservation.productName}
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
          <p className="mt-4 text-base font-bold text-gray-900">
            {reservation.storeName} {reservation.productName}
          </p>
          <dl className="mt-4 grid gap-2 text-sm md:grid-cols-[72px_minmax(0,1fr)]">
            <dt className="text-gray-500">픽업 날짜</dt>
            <dd className="text-gray-700">
              {reservation.pickupDate} &nbsp; {reservation.pickupTime}
            </dd>
            <dt className="text-gray-500">주문번호</dt>
            <dd className="text-gray-700">{reservation.orderNumber}</dd>
          </dl>
        </div>

        <div>
          <p className="text-xl font-bold text-gray-900">
            {reservation.price.toLocaleString()}원
          </p>
          <p className="mt-2 text-sm text-gray-500">
            수량&nbsp; {reservation.quantity}개
          </p>
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
            color={statusGroup === 'pendingPickup' ? 'primary' : 'gray'}
            disabled
            className="h-12 min-w-32 px-5 text-sm"
          >
            {status.actionLabel}
          </Button>
        </div>

        <button
          type="button"
          aria-label="예약 메뉴 열기"
          disabled
          className="hidden cursor-not-allowed rounded-sm p-1 text-gray-400 md:block"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
