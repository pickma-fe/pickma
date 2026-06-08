import type { AdminDashboardStats } from '@/types/admin';
import type { OrderStatus } from '@/types/order';
import type { AdminDashboardStatsResponse } from '@/contracts/admin';

const ORDER_STATUS_MAP: Record<
  AdminDashboardStatsResponse['recentOrders'][number]['status'],
  OrderStatus
> = {
  payment_pending: 'paymentPending',
  processing: 'processing',
  reserved: 'reserved',
  accepted: 'accepted',
  ready: 'ready',
  completed: 'completed',
  cancelling: 'cancelling',
  cancelled: 'cancelled',
  no_show: 'noShow',
  expired: 'expired',
};

export function mapAdminDashboardStats(
  response: AdminDashboardStatsResponse
): AdminDashboardStats {
  return {
    totalStores: response.totalStores,
    totalProducts: response.totalProducts,
    totalOrders: response.totalOrders,
    totalUsers: response.totalUsers,
    dailyMetrics: response.dailyMetrics.map((metric) => ({
      ...metric,
      date: new Date(metric.date),
    })),
    recentPendingApplications: response.recentPendingApplications.map(
      (application) => ({
        ...application,
        createdAt: new Date(application.createdAt),
      })
    ),
    recentOrders: response.recentOrders.map((order) => ({
      ...order,
      status: ORDER_STATUS_MAP[order.status],
      createdAt: new Date(order.createdAt),
    })),
    recentUsers: response.recentUsers.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
    })),
  };
}
