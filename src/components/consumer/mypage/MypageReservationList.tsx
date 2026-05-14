'use client';

import { useState } from 'react';

import type { OrderStatusParam } from '@/contracts/order';
import type { MockMypageReservation } from '@/mocks/mypage';

import { MypageReservationCard } from './MypageReservationCard';

interface ReservationTab {
  id: 'all' | 'pendingPickup' | 'completed' | 'cancelled';
  label: string;
}

interface MypageReservationListProps {
  reservations: MockMypageReservation[];
}

const reservationTabs: ReservationTab[] = [
  { id: 'all', label: '전체 예약' },
  { id: 'pendingPickup', label: '픽업 대기' },
  { id: 'completed', label: '픽업 완료' },
  { id: 'cancelled', label: '취소/환불' },
];

const tabStatusMap: Record<
  Exclude<ReservationTab['id'], 'all'>,
  OrderStatusParam[]
> = {
  pendingPickup: ['payment_pending', 'reserved', 'ready'],
  completed: ['completed'],
  cancelled: ['cancelled', 'no_show', 'expired'],
};

export function MypageReservationList({
  reservations,
}: MypageReservationListProps) {
  const [activeTabId, setActiveTabId] = useState<ReservationTab['id']>('all');
  const filteredReservations =
    activeTabId === 'all'
      ? reservations
      : reservations.filter((reservation) =>
          tabStatusMap[activeTabId].includes(reservation.status)
        );

  return (
    <section aria-labelledby="mypage-reservation-title">
      <h1
        id="mypage-reservation-title"
        className="text-2xl font-bold text-gray-900"
      >
        내 예약
      </h1>

      <div className="mt-8 border-b border-gray-200">
        <div className="flex gap-8" aria-label="예약 상태 필터">
          {reservationTabs.map((tab) => {
            const isActive = activeTabId === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                className={[
                  'focus-visible:ring-primary-500 border-b-2 px-3 py-4 text-base font-bold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  isActive
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-600 hover:text-gray-900',
                ].join(' ')}
                onClick={() => setActiveTabId(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 max-h-[534px] space-y-4 overflow-y-auto pr-2">
        {filteredReservations.map((reservation) => (
          <MypageReservationCard
            key={reservation.id}
            reservation={reservation}
          />
        ))}

        {filteredReservations.length === 0 ? (
          <div className="flex min-h-60 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
            해당 상태의 예약이 없습니다.
          </div>
        ) : null}
      </div>
    </section>
  );
}
