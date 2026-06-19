import type { OrderStatusParam } from './order';

export interface SellerDashboardStatsResponse {
  totalSalesAmount: number;
  totalOrderCount: number;
  dailyMetrics: SellerDashboardDailyMetricResponse[];
  recentOrders: SellerDashboardRecentOrderResponse[];
}

export interface SellerDashboardDailyMetricResponse {
  date: string;
  orderCount: number;
  salesAmount: number;
}

export interface SellerDashboardRecentOrderResponse {
  id: string;
  orderNumber: string;
  productName: string;
  paymentAmount: number;
  status: OrderStatusParam;
  createdAt: string;
}
