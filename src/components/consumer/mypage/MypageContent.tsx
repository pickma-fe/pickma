'use client';

import { useState } from 'react';

import { useOrders } from '@/hooks/orders/useOrders';

import { MypageReservationList } from './MypageReservationList';
import {
  mapOrderToMypageReservation,
  type MypageReservation,
} from './mypageReservationMapper';

const ORDER_LIST_PAGE_SIZE = 10;

const ORDER_LIST_QUERY_BASE = {
  sort: 'pickupAt' as const,
  order: 'desc' as const,
};

export function MypageContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: orderList,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useOrders({
    ...ORDER_LIST_QUERY_BASE,
    page: currentPage,
    pageSize: ORDER_LIST_PAGE_SIZE,
  });
  const reservations: MypageReservation[] =
    orderList?.items.map((order) => mapOrderToMypageReservation(order)) ?? [];
  const totalPages = orderList?.totalPages ?? 1;

  const handleRetryReservations = () => {
    void refetch();
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <MypageReservationList
      reservations={reservations}
      isError={isError}
      isLoading={isLoading}
      isRefetching={isFetching}
      currentPage={currentPage}
      totalPages={totalPages}
      onRetry={handleRetryReservations}
      onPageChange={handleChangePage}
    />
  );
}
