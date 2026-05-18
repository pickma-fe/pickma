'use client';

import { useState } from 'react';

import type { OrderListItemResponse } from '@/contracts/order';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { Pagination } from '@/components/common/Pagination/Pagination';

interface OrderTableProps {
  orders: OrderListItemResponse[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onOrderAction: (orderId: string, newStatus: string) => void;
}

const PAGE_SIZE_OPTIONS = [
  { label: '5개씩 보기', value: '5' },
  { label: '10개씩 보기', value: '10' },
  { label: '20개씩 보기', value: '20' },
];

const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ko-KR');
const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const STATUS_BADGE: Record<
  string,
  { label: string; color: 'warning' | 'info' | 'success' | 'danger' | 'gray' }
> = {
  processing: { label: '접수 대기', color: 'warning' },
  reserved: { label: '준비 중', color: 'info' },
  ready: { label: '준비 완료', color: 'info' },
  completed: { label: '픽업 완료', color: 'success' },
  cancelled: { label: '취소/환불', color: 'danger' },
  no_show: { label: '미수령', color: 'gray' },
  payment_pending: { label: '결제 대기', color: 'warning' },
  expired: { label: '만료', color: 'gray' },
};

const STATUS_DESCRIPTION: Record<string, string> = {
  processing: '주문이 접수되었습니다.',
  reserved: '주문 상품을 준비해주세요.',
  ready: '고객 픽업을 기다리고 있습니다.',
  completed: '픽업이 완료되었습니다.',
  cancelled: '주문이 취소/환불되었습니다.',
  no_show: '고객이 미수령하였습니다.',
};

function OrderActionButtons({
  order,
  onOrderAction,
}: {
  order: OrderListItemResponse;
  onOrderAction: (orderId: string, newStatus: string) => void;
}) {
  switch (order.status) {
    case 'processing':
      return (
        <div className="flex w-fit flex-col gap-2">
          <Button
            className="w-fit px-2 py-0.5 text-sm"
            onClick={() => onOrderAction(order.id, 'reserved')}
          >
            주문 접수
          </Button>
          <Button
            className="w-fit px-2 py-0.5 text-sm"
            variant="outline"
            color="danger"
            onClick={() => onOrderAction(order.id, 'cancelled')}
          >
            주문 취소
          </Button>
        </div>
      );
    case 'reserved':
      return (
        <div className="flex w-fit flex-col gap-2">
          <Button
            className="w-fit px-2 py-0.5 text-sm"
            onClick={() => onOrderAction(order.id, 'ready')}
          >
            준비 완료
          </Button>
          <Button
            className="w-fit px-2 py-0.5 text-sm"
            variant="outline"
            color="danger"
            onClick={() => onOrderAction(order.id, 'cancelled')}
          >
            주문 취소
          </Button>
        </div>
      );
    case 'ready':
      return (
        <Button
          className="w-fit px-2 py-0.5 text-sm"
          onClick={() => onOrderAction(order.id, 'completed')}
        >
          픽업 완료
        </Button>
      );
    case 'completed':
    case 'cancelled':
    case 'no_show':
      return null;
    default:
      return null;
  }
}

export function OrderTable({
  orders,
  currentPage,
  onPageChange,
  onOrderAction,
}: OrderTableProps) {
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(orders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = orders.slice(startIndex, startIndex + pageSize);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    onPageChange(1);
  };

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white">
        <div className="text-center">
          <p className="text-sm text-gray-500">주문 내역이 없습니다.</p>
          <p className="text-xs text-gray-400">아직 접수된 주문이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">주문 목록</caption>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium text-gray-500"
              >
                주문 정보
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                주문 금액
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                픽업 정보
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                주문 상태
              </th>
              <th
                scope="col"
                className="w-fit px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order, index) => {
              const badge = STATUS_BADGE[order.status] ?? {
                label: order.status,
                color: 'gray' as const,
              };
              const description = STATUS_DESCRIPTION[order.status] ?? '';

              return (
                <tr
                  key={order.id}
                  className={`hover:bg-gray-50 ${
                    index !== paginatedOrders.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          🛍️
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.storeName}
                        </p>
                        <p className="text-xs text-gray-400">
                          주문일 {formatDate(order.createdAt)}{' '}
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(order.paymentAmount)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-gray-900">
                        {formatDate(order.pickupAt)}{' '}
                        {formatTime(order.pickupAt)}
                      </p>
                      {order.pickupNumber && (
                        <p className="text-xs text-gray-400">
                          픽업 번호 {order.pickupNumber}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="w-40 px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="w-fit">
                        <Badge variant="soft" color={badge.color}>
                          {badge.label}
                        </Badge>
                      </div>
                      {description && (
                        <p className="text-xs text-gray-400">{description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <OrderActionButtons
                      order={order}
                      onOrderAction={onOrderAction}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="relative flex items-center justify-center border-t border-gray-200 px-4 py-4">
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
        <div className="absolute right-4">
          <Dropdown
            type="select"
            items={PAGE_SIZE_OPTIONS}
            value={String(pageSize)}
            onChange={handlePageSizeChange}
            placeholder="10개씩 보기"
          />
        </div>
      </div>
    </div>
  );
}
