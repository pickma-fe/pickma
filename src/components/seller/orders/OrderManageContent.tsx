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
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import type {
  SellerOrderActionStatus,
  SellerOrderDisplayStatus,
} from '@/types/seller-order';
import { useAcceptSellerOrder } from '@/hooks/seller/orders/useAcceptSellerOrder';
import { useCancelSellerOrder } from '@/hooks/seller/orders/useCancelSellerOrder';
import { useCompleteSellerOrder } from '@/hooks/seller/orders/useCompleteSellerOrder';
import { useMarkSellerOrderReady } from '@/hooks/seller/orders/useMarkSellerOrderReady';
import { useSellerOrders } from '@/hooks/seller/orders/useSellerOrders';
import { useSellerOrderSummary } from '@/hooks/seller/orders/useSellerOrderSummary';
import { Section } from '@/components/common/Section/Section';

import { OrderCancelModal } from './OrderCancelModal';
import { OrderCompleteConfirmModal } from './OrderCompleteConfirmModal';
import { OrderFilter } from './OrderFilter';
import { OrderTable } from './OrderTable';

type SellerOrderFilterStatus = SellerOrderDisplayStatus | '전체';

const VALID_STATUSES: SellerOrderDisplayStatus[] = [
  'reserved',
  'accepted',
  'ready',
  'completed',
  'cancelling',
  'cancelled',
  'noShow',
];

function parseStatusParam(param: string | null): SellerOrderFilterStatus {
  if (param && (VALID_STATUSES as string[]).includes(param)) {
    return param as SellerOrderDisplayStatus;
  }
  return '전체';
}

const PAGE_SIZE = 20;

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStatus = parseStatusParam(searchParams.get('status'));
  const [selectedStatus, setSelectedStatus] =
    useState<SellerOrderFilterStatus>(initialStatus);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [cancelPendingOrderId, setCancelPendingOrderId] = useState<
    string | null
  >(null);
  const [cancelErrorMessage, setCancelErrorMessage] = useState<string | null>(
    null
  );

  const [completePendingOrderId, setCompletePendingOrderId] = useState<
    string | null
  >(null);

  const serverStatus = selectedStatus === '전체' ? undefined : selectedStatus;

  const { data: summary } = useSellerOrderSummary();

  const { data, isLoading, isError } = useSellerOrders({
    page: currentPage,
    pageSize: PAGE_SIZE,
    status: serverStatus,
    sort: 'createdAt',
    order: 'desc',
  });

  const acceptOrder = useAcceptSellerOrder();
  const markOrderReady = useMarkSellerOrderReady();
  const completeOrder = useCompleteSellerOrder();
  const cancelOrder = useCancelSellerOrder();

  const isPending =
    acceptOrder.isPending ||
    markOrderReady.isPending ||
    completeOrder.isPending ||
    cancelOrder.isPending;

  const displayOrders = (data?.items ?? []).filter(
    (order) =>
      searchKeyword.trim() === '' ||
      order.orderNumber
        .toLowerCase()
        .includes(searchKeyword.trim().toLowerCase())
  );

  const completePendingOrder = completePendingOrderId
    ? (displayOrders.find((o) => o.id === completePendingOrderId) ?? null)
    : null;

  const totalPages = data?.totalPages ?? 0;

  const getCount = (value: SellerOrderFilterStatus): number | null => {
    if (!summary) return null;
    if (value === '전체') return summary.totalCount;
    if (value === 'noShow') return summary.statusCounts.noShow;
    return summary.statusCounts[value];
  };

  const handleOrderAction = (
    orderId: string,
    newStatus: SellerOrderActionStatus
  ) => {
    if (isPending) return;

    setActionError(null);
    setActionSuccess(null);

    const onSuccess = (label: string) => {
      setActionSuccess(`${label} 처리가 완료되었습니다.`);
      setCurrentPage(1);
    };
    const onError = (label: string) => {
      setActionError(`${label} 처리에 실패했습니다. 다시 시도해주세요.`);
    };

    switch (newStatus) {
      case 'accepted':
        acceptOrder.mutate(orderId, {
          onSuccess: () => onSuccess('주문 접수'),
          onError: () => onError('주문 접수'),
        });
        break;
      case 'ready':
        markOrderReady.mutate(orderId, {
          onSuccess: () => onSuccess('준비 완료'),
          onError: () => onError('준비 완료'),
        });
        break;
      case 'completed':
        setCompletePendingOrderId(orderId);
        break;
    }
  };

  const handleCancelRequest = (orderId: string) => {
    setCancelErrorMessage(null);
    setCancelPendingOrderId(orderId);
  };

  const handleCancelConfirm = (reason: string) => {
    if (!cancelPendingOrderId) return;
    cancelOrder.mutate(
      { id: cancelPendingOrderId, reason },
      {
        onSuccess: () => {
          setCancelPendingOrderId(null);
          setCancelErrorMessage(null);
          setActionSuccess('주문 취소 처리가 완료되었습니다.');
          setCurrentPage(1);
        },
        onError: () => {
          setCancelErrorMessage(
            '주문 취소 처리에 실패했습니다. 다시 시도해주세요.'
          );
        },
      }
    );
  };

  const handleCompleteConfirm = () => {
    if (!completePendingOrderId) return;
    completeOrder.mutate(completePendingOrderId, {
      onSuccess: () => {
        setCompletePendingOrderId(null);
        setActionSuccess('픽업 완료 처리가 완료되었습니다.');
        setCurrentPage(1);
      },
      onError: () => {
        setCompletePendingOrderId(null);
        setActionError('픽업 완료 처리에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as SellerOrderFilterStatus);
    setCurrentPage(1);
    // URL query 동기화
    const params = new URLSearchParams(searchParams.toString());
    if (status === '전체') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.replace(`/seller/orders?${params.toString()}`);
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedStatus === card.value;
          const count = getCount(card.value);

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
                      {isLoading && (
                        <span className="text-base text-gray-400">...</span>
                      )}
                      {!isLoading && count !== null && (
                        <>
                          {count}
                          <span className="text-base font-normal text-gray-500">
                            {' '}
                            건
                          </span>
                        </>
                      )}
                      {!isLoading && count === null && (
                        <span className="text-base text-gray-400">-</span>
                      )}
                    </p>
                  </div>
                </div>
              </Section>
            </button>
          );
        })}
      </div>

      {actionSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      <OrderFilter
        searchKeyword={searchKeyword}
        onSearchChange={handleSearchChange}
      />

      <OrderTable
        orders={displayOrders}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onOrderAction={handleOrderAction}
        onCancelRequest={handleCancelRequest}
        isLoading={isLoading}
        isError={isError}
        isActionPending={isPending}
      />

      <OrderCancelModal
        isOpen={cancelPendingOrderId !== null}
        isSubmitting={cancelOrder.isPending}
        errorMessage={cancelErrorMessage}
        onClose={() => {
          setCancelPendingOrderId(null);
          setCancelErrorMessage(null);
        }}
        onConfirm={handleCancelConfirm}
      />

      <OrderCompleteConfirmModal
        isOpen={completePendingOrderId !== null}
        isSubmitting={completeOrder.isPending}
        orderNumber={completePendingOrder?.orderNumber ?? ''}
        pickupNumber={completePendingOrder?.pickupNumber ?? null}
        storeOrderNumber={completePendingOrder?.storeOrderNumber ?? null}
        onClose={() => setCompletePendingOrderId(null)}
        onConfirm={handleCompleteConfirm}
      />
    </div>
  );
}
