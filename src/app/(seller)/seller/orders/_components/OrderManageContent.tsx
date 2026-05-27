'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  PackageCheck,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type { Order } from '@/types/order';
import { useAcceptSellerOrder } from '@/hooks/seller/orders/useAcceptSellerOrder';
import { useCompleteSellerOrder } from '@/hooks/seller/orders/useCompleteSellerOrder';
import { useMarkSellerOrderReady } from '@/hooks/seller/orders/useMarkSellerOrderReady';
import { useSellerOrders } from '@/hooks/seller/orders/useSellerOrders';
import { Section } from '@/components/common/Section/Section';

import { OrderFilter } from './OrderFilter';
import { OrderTable } from './OrderTable';
import type {
  SellerOrderActionStatus,
  SellerOrderDisplayStatus,
} from '../_lib/sellerOrderTypes';

type SellerOrderListItem = Omit<Order, 'items' | 'payment'>;
type SellerOrderFilterStatus = SellerOrderDisplayStatus | '전체';

const SELLER_DISPLAY_STATUSES = new Set<SellerOrderDisplayStatus>([
  'reserved',
  'accepted',
  'ready',
  'completed',
  'cancelled',
  'noShow',
]);

const STAT_CARDS: {
  label: string;
  value: SellerOrderFilterStatus;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
}[] = [
  {
    label: '전체',
    value: '전체',
    icon: Package,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  {
    label: '수락 대기',
    value: 'reserved',
    icon: ShoppingBag,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    label: '주문 승인',
    value: 'accepted',
    icon: Clock,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: '픽업 대기',
    value: 'ready',
    icon: PackageCheck,
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    label: '픽업 완료',
    value: 'completed',
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    label: '취소/환불',
    value: 'cancelled',
    icon: XCircle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    label: '미수령',
    value: 'noShow',
    icon: AlertCircle,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
];

export function OrderManageContent() {
  const [selectedStatus, setSelectedStatus] =
    useState<SellerOrderFilterStatus>('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError } = useSellerOrders();
  const acceptOrder = useAcceptSellerOrder();
  const markOrderReady = useMarkSellerOrderReady();
  const completeOrder = useCompleteSellerOrder();

  const displayOrders = useMemo<SellerOrderListItem[]>(
    () =>
      (data?.items ?? []).filter((o) =>
        SELLER_DISPLAY_STATUSES.has(o.status as SellerOrderDisplayStatus)
      ),
    [data?.items]
  );

  const getCount = (value: SellerOrderFilterStatus) => {
    if (value === '전체') return displayOrders.length;
    return displayOrders.filter((o) => o.status === value).length;
  };

  const filteredOrders = useMemo(
    () =>
      displayOrders.filter((order) => {
        const matchStatus =
          selectedStatus === '전체' || order.status === selectedStatus;
        const matchSearch =
          searchKeyword.trim() === '' ||
          order.orderNumber
            .toLowerCase()
            .includes(searchKeyword.trim().toLowerCase());
        return matchStatus && matchSearch;
      }),
    [displayOrders, selectedStatus, searchKeyword]
  );

  const handleOrderAction = (
    orderId: string,
    newStatus: SellerOrderActionStatus
  ) => {
    if (
      acceptOrder.isPending ||
      markOrderReady.isPending ||
      completeOrder.isPending
    ) {
      return;
    }

    switch (newStatus) {
      case 'accepted':
        acceptOrder.mutate(orderId);
        break;
      case 'ready':
        markOrderReady.mutate(orderId);
        break;
      case 'completed':
        completeOrder.mutate(orderId);
        break;
      case 'cancelled':
        // TODO: T31 주문 취소/환불 API 구현 후 연결
        break;
    }
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as SellerOrderFilterStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          주문 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          접수된 주문을 확인하고, 픽업 상태를 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedStatus === card.value;

          return (
            <button
              key={card.value}
              onClick={() => handleStatusChange(card.value)}
              className="text-left"
            >
              <Section
                variant="card"
                className={`bg-white transition-all ${
                  isSelected
                    ? 'ring-primary-500 ring-2'
                    : 'hover:ring-1 hover:ring-gray-300'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${card.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? (
                        <span className="text-base text-gray-400">...</span>
                      ) : (
                        <>
                          {getCount(card.value)}
                          <span className="text-base font-normal text-gray-500">
                            건
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </Section>
            </button>
          );
        })}
      </div>

      <OrderFilter
        selectedStatus={selectedStatus}
        searchKeyword={searchKeyword}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
      />

      <OrderTable
        orders={filteredOrders}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onOrderAction={handleOrderAction}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}
