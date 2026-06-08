import type { OrderStatus } from './order';

export interface AdminDashboardStats {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  dailyMetrics: DailyAdminMetric[];
  recentPendingApplications: AdminDashboardPendingApplicationSummary[];
  recentOrders: AdminDashboardRecentOrder[];
  recentUsers: AdminDashboardRecentUser[];
}

export interface DailyAdminMetric {
  date: Date;
  orderCount: number;
  salesAmount: number;
}

export interface AdminDashboardPendingApplicationSummary {
  id: string;
  companyName: string;
  businessCategory: string;
  createdAt: Date;
}

export interface AdminDashboardRecentOrder {
  id: string;
  productName: string;
  storeName: string;
  paymentAmount: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface AdminDashboardRecentUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
