'use client';

import {
  PackageIcon,
  ShoppingBagIcon,
  StoreIcon,
  UsersIcon,
} from 'lucide-react';

import { useAdminDashboardStats } from '@/hooks/admin/dashboard/useAdminDashboardStats';
import { Button } from '@/components/common/Button/Button';

import { AdminDashboardDailyChart } from './AdminDashboardDailyChart';
import { AdminDashboardPendingApplications } from './AdminDashboardPendingApplications';
import { AdminDashboardRecentOrders } from './AdminDashboardRecentOrders';
import { AdminDashboardRecentUsers } from './AdminDashboardRecentUsers';
import { AdminDashboardStatCard } from './AdminDashboardStatCard';

const EMPTY_STATS = {
  totalStores: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalUsers: 0,
  dailyMetrics: [],
  recentPendingApplications: [],
  recentOrders: [],
  recentUsers: [],
};

export function AdminDashboardPageContent() {
  const { data, isLoading, isError, refetch, isFetching } =
    useAdminDashboardStats();
  const stats = data ?? EMPTY_STATS;
  const shouldRenderDashboardBody = isLoading || Boolean(data);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-sm text-gray-500">
          픽마 플랫폼의 주요 현황을 한눈에 확인하세요.
        </p>
      </header>

      {isError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>대시보드 통계를 불러오지 못했습니다.</p>
          <Button
            type="button"
            variant="outline"
            className="px-3 py-1.5 text-sm"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            다시 시도
          </Button>
        </div>
      )}

      {shouldRenderDashboardBody && (
        <>
          <section
            aria-label="관리자 대시보드 통계"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <AdminDashboardStatCard
              label="총 가게 수"
              value={stats.totalStores}
              icon={StoreIcon}
              isLoading={isLoading}
            />
            <AdminDashboardStatCard
              label="총 상품 수"
              value={stats.totalProducts}
              icon={ShoppingBagIcon}
              isLoading={isLoading}
            />
            <AdminDashboardStatCard
              label="총 주문 수"
              value={stats.totalOrders}
              icon={PackageIcon}
              isLoading={isLoading}
            />
            <AdminDashboardStatCard
              label="총 사용자 수"
              value={stats.totalUsers}
              icon={UsersIcon}
              isLoading={isLoading}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <AdminDashboardDailyChart metrics={stats.dailyMetrics} />
            <AdminDashboardPendingApplications
              applications={stats.recentPendingApplications}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AdminDashboardRecentOrders orders={stats.recentOrders} />
            <AdminDashboardRecentUsers users={stats.recentUsers} />
          </section>
        </>
      )}
    </div>
  );
}
