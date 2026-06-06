export interface AdminDashboardStats {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  dailyMetrics: AdminDashboardDailyMetric[];
  recentPendingApplications: AdminDashboardPendingApplicationSummary[];
  recentOrders: AdminDashboardRecentOrder[];
  recentUsers: AdminDashboardRecentUser[];
}

export interface AdminDashboardDailyMetric {
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
  status: AdminDashboardRecentOrderStatus;
  createdAt: Date;
}

export type AdminDashboardRecentOrderStatus =
  | 'payment_pending'
  | 'processing'
  | 'reserved'
  | 'accepted'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'expired';

export interface AdminDashboardRecentUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
