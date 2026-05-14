'use client';

import { useOrders } from '@/hooks/orders/useOrders';

import { MypageReservationList } from './MypageReservationList';
import {
  mapOrderToMypageReservation,
  type MypageReservation,
} from './mypageReservationMapper';

const ORDER_LIST_QUERY = {
  page: 1,
  pageSize: 20,
  sort: 'pickupAt' as const,
  order: 'desc' as const,
};

export function MypageContent() {
  const {
    data: orderList,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useOrders(ORDER_LIST_QUERY);
  const reservations: MypageReservation[] =
    orderList?.items.map((order, index) =>
      mapOrderToMypageReservation(order, index)
    ) ?? [];

  const handleRetryReservations = () => {
    void refetch();
  };

  return (
    <MypageReservationList
      reservations={reservations}
      isError={isError}
      isLoading={isLoading}
      isRefetching={isFetching}
      onRetry={handleRetryReservations}
    />
  );
}
