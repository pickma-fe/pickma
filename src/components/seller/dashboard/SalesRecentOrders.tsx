import Link from 'next/link';

import type { OrderStatusParam } from '@/contracts/order';
import type { SellerDashboardRecentOrderResponse } from '@/contracts/seller';

interface SalesRecentOrdersProps {
  recentOrders: SellerDashboardRecentOrderResponse[];
  isLoading: boolean;
}

const STATUS_LABEL: Record<OrderStatusParam, string> = {
  payment_pending: '결제 대기',
  processing: '처리 중',
  reserved: '수락 대기',
  accepted: '주문 승인',
  ready: '픽업 대기',
  completed: '픽업 완료',
  cancelled: '취소',
  cancelling: '취소 처리 중',
  no_show: '미수령',
  expired: '만료',
};

const STATUS_COLOR: Record<OrderStatusParam, string> = {
  payment_pending: 'text-gray-500 bg-gray-100',
  processing: 'text-gray-500 bg-gray-100',
  reserved: 'text-yellow-700 bg-yellow-100',
  accepted: 'text-blue-700 bg-blue-100',
  ready: 'text-indigo-700 bg-indigo-100',
  completed: 'text-green-700 bg-green-100',
  cancelled: 'text-red-700 bg-red-100',
  cancelling: 'text-red-700 bg-red-100',
  no_show: 'text-gray-700 bg-gray-100',
  expired: 'text-gray-500 bg-gray-100',
};

function formatTimeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

export function SalesRecentOrders({
  recentOrders,
  isLoading,
}: SalesRecentOrdersProps) {
  if (isLoading) {
    return (
      <div className="flex h-20 items-center justify-center">
        <span className="text-sm text-gray-400">불러오는 중...</span>
      </div>
    );
  }

  if (recentOrders.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        최근 주문이 없습니다.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {recentOrders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/seller/orders/${order.id}`}
            className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-gray-900">
                {order.productName}
              </span>
              <span className="text-xs text-gray-400">
                {order.orderNumber} · {formatTimeAgo(order.createdAt)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-semibold text-gray-900">
                {order.paymentAmount.toLocaleString('ko-KR')}원
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status]}`}
              >
                {STATUS_LABEL[order.status]}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
