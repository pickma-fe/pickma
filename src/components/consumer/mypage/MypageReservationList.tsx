'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useState } from 'react';

import type { OrderStatus } from '@/types/order';
import { Button } from '@/components/common';

import { MypageReservationCard } from './MypageReservationCard';
import type { MypageReservation } from './mypageReservationMapper';

interface ReservationTab {
  id: 'all' | 'pendingPickup' | 'completed' | 'cancelled';
  label: string;
}

interface MypageReservationListProps {
  reservations: MypageReservation[];
  isError?: boolean;
  isLoading?: boolean;
  isRefetching?: boolean;
  onRetry?: () => void;
}

const reservationTabs: ReservationTab[] = [
  { id: 'all', label: '전체 예약' },
  { id: 'pendingPickup', label: '픽업 대기' },
  { id: 'completed', label: '픽업 완료' },
  { id: 'cancelled', label: '취소/환불' },
];

const tabStatusMap: Record<
  Exclude<ReservationTab['id'], 'all'>,
  OrderStatus[]
> = {
  pendingPickup: ['reserved', 'accepted', 'ready'],
  completed: ['completed'],
  cancelled: ['cancelled', 'noShow', 'expired'],
};

export function MypageReservationList({
  reservations,
  isError = false,
  isLoading = false,
  isRefetching = false,
  onRetry,
}: MypageReservationListProps) {
  const [activeTabId, setActiveTabId] = useState<ReservationTab['id']>('all');
  const filteredReservations =
    activeTabId === 'all'
      ? reservations
      : reservations.filter((reservation) =>
          tabStatusMap[activeTabId].includes(reservation.status)
        );
  const handleChangeTab = (index: number) => {
    setActiveTabId(reservationTabs[index]?.id ?? 'all');
  };

  return (
    <section aria-labelledby="mypage-reservation-title">
      <h1
        id="mypage-reservation-title"
        className="text-2xl font-bold text-gray-900"
      >
        내 예약
      </h1>

      <TabGroup onChange={handleChangeTab}>
        <TabList
          aria-label="예약 상태 필터"
          className="mt-8 flex gap-8 border-b border-gray-200"
        >
          {reservationTabs.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                [
                  'focus-visible:ring-primary-500 rounded-sm border-b-2 px-3 py-4 text-base font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  selected
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-600 hover:text-gray-900',
                ].join(' ')
              }
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {reservationTabs.map((tab) => (
            <TabPanel
              key={tab.id}
              className="focus-visible:ring-primary-500 mt-6 space-y-4 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <div className="flex min-h-60 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
                  예약 내역을 불러오는 중입니다.
                </div>
              ) : null}

              {isError ? (
                <div className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-red-200 bg-red-50 px-4 text-center">
                  <div>
                    <p className="text-sm font-semibold text-red-500">
                      예약 내역을 불러오지 못했습니다.
                    </p>
                    <p className="mt-2 text-xs text-red-400">
                      일시적인 오류일 수 있으니 다시 시도해 주세요.
                    </p>
                  </div>
                  {onRetry ? (
                    <Button
                      type="button"
                      color="danger"
                      disabled={isRefetching}
                      onClick={onRetry}
                    >
                      {isRefetching ? '다시 불러오는 중' : '다시 시도'}
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {!isLoading && !isError
                ? filteredReservations.map((reservation) => (
                    <MypageReservationCard
                      key={reservation.id}
                      reservation={reservation}
                    />
                  ))
                : null}

              {!isLoading && !isError && filteredReservations.length === 0 ? (
                <div className="flex min-h-60 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
                  해당 상태의 예약이 없습니다.
                </div>
              ) : null}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </section>
  );
}
