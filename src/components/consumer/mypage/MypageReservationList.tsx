'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

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
  MockMypageReservation['status'][]
> = {
  pendingPickup: ['reserved', 'ready'],
  completed: ['completed'],
  cancelled: ['cancelled', 'no_show', 'expired'],
};

export function MypageReservationList({
  reservations,
}: MypageReservationListProps) {
  return (
    <section aria-labelledby="mypage-reservation-title">
      <h1
        id="mypage-reservation-title"
        className="text-2xl font-bold text-gray-900"
      >
        내 예약
      </h1>

      <TabGroup>
        <TabList
          aria-label="예약 상태 필터"
          className="mt-8 flex gap-8 border-b border-gray-200"
        >
          {reservationTabs.map((tab) => {
            return (
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
            );
          })}
        </TabList>

        <TabPanels>
          {reservationTabs.map((tab) => {
            const filteredReservations = getFilteredReservations(
              reservations,
              tab.id
            );

            return (
              <TabPanel
                key={tab.id}
                className="focus-visible:ring-primary-500 mt-6 max-h-[534px] space-y-4 overflow-y-auto rounded-sm pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
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
              </TabPanel>
            );
          })}
        </TabPanels>
      </TabGroup>
    </section>
  );
}

function getFilteredReservations(
  reservations: MockMypageReservation[],
  activeTabId: ReservationTab['id']
) {
  if (activeTabId === 'all') {
    return reservations;
  }

  return reservations.filter((reservation) =>
    tabStatusMap[activeTabId].includes(reservation.status)
  );
}
