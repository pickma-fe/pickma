import type { AdminDashboardRecentOrder } from '@/types/admin';

import { AdminCard } from './AdminCard';

interface AdminDashboardRecentOrdersProps {
  orders: AdminDashboardRecentOrder[];
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('ko-KR');
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const ORDER_STATUS_LABELS: Record<string, string> = {
  payment_pending: '결제 대기',
  processing: '처리 중',
  reserved: '접수 대기',
  accepted: '준비 중',
  ready: '준비 완료',
  completed: '픽업 완료',
  cancelled: '취소',
  no_show: '노쇼',
  expired: '만료',
};

export function AdminDashboardRecentOrders({
  orders,
}: AdminDashboardRecentOrdersProps) {
  return (
    <AdminCard title="최근 주문 내역">
      <ul className="divide-y divide-gray-100">
        {orders.length > 0 ? (
          orders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {order.productName}
                </p>
                <p className="mt-1 text-xs text-gray-500">{order.storeName}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {CURRENCY_FORMATTER.format(order.paymentAmount)}원
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {ORDER_STATUS_LABELS[order.status] ?? order.status} ·{' '}
                  {DATE_TIME_FORMATTER.format(order.createdAt)}
                </p>
              </div>
            </li>
          ))
        ) : (
          <li className="py-6 text-sm text-gray-500">최근 주문이 없습니다.</li>
        )}
      </ul>
    </AdminCard>
  );
}
