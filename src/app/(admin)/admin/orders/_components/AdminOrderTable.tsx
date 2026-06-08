'use client';

import type { AdminOrderListItem } from '@/types/admin';
import { Badge } from '@/components/common/Badge/Badge';
import { AdminTable } from '@/app/(admin)/admin/_components/AdminTable';

import {
  formatAdminOrderAmount,
  formatAdminOrderDate,
  ORDER_STATUS_LABELS,
} from './adminOrderUtils';

interface AdminOrderTableProps {
  orders: AdminOrderListItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminOrderTable({
  orders,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: AdminOrderTableProps) {
  return (
    <AdminTable
      data={orders}
      rowKey={(order) => order.id}
      isLoading={isLoading}
      emptyMessage="조건에 맞는 주문이 없습니다."
      pagination={{
        currentPage,
        totalPages,
        onPageChange,
      }}
      columns={[
        {
          key: 'createdAt',
          header: '주문일',
          render: (order) => formatAdminOrderDate(order.createdAt),
        },
        {
          key: 'orderNumber',
          header: '주문',
          render: (order) => (
            <div className="min-w-56">
              <p className="font-semibold text-gray-900">{order.orderNumber}</p>
              <p className="mt-1 text-xs text-gray-500">{order.storeName}</p>
            </div>
          ),
        },
        {
          key: 'pickup',
          header: '픽업',
          render: (order) => (
            <div>
              <p>{formatAdminOrderDate(order.pickupAt)}</p>
              <p className="mt-1 text-xs text-gray-500">
                {order.pickupNumber
                  ? `픽업번호 ${order.pickupNumber}`
                  : '픽업번호 없음'}
              </p>
            </div>
          ),
        },
        {
          key: 'amount',
          header: '결제 금액',
          render: (order) => (
            <span className="font-semibold">
              {formatAdminOrderAmount(order.paymentAmount)}원
            </span>
          ),
        },
        {
          key: 'status',
          header: '주문 상태',
          render: (order) => (
            <Badge
              color={order.status === 'processing' ? 'warning' : 'gray'}
              rounded="md"
            >
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          ),
        },
      ]}
    />
  );
}
