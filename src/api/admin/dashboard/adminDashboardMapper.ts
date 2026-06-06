import type { AdminDashboardStats } from '@/types/admin';
import type { AdminDashboardStatsResponse } from '@/contracts/admin';

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
      createdAt: new Date(order.createdAt),
    })),
    recentUsers: response.recentUsers.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
    })),
  };
}
