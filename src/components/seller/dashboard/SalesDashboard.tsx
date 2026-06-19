'use client';

import { AlertCircle } from 'lucide-react';

import { useSellerDashboardStats } from '@/hooks/seller/dashboard/useSellerDashboardStats';
import { Section } from '@/components/common/Section/Section';

import { SalesDailyChart } from './SalesDailyChart';
import { SalesRecentOrders } from './SalesRecentOrders';
import { SalesSummaryCards } from './SalesSummaryCards';

export function SalesDashboard() {
  const { data, isLoading, isError } = useSellerDashboardStats();

  return (
    <div className="flex flex-col gap-4">
      {isError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          매출 통계를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </div>
      )}

      <SalesSummaryCards
        totalSalesAmount={data?.totalSalesAmount ?? 0}
        totalOrderCount={data?.totalOrderCount ?? 0}
        isLoading={isLoading}
      />

      <Section variant="card" className="bg-white">
        <SalesDailyChart
          dailyMetrics={data?.dailyMetrics ?? []}
          isLoading={isLoading}
        />
      </Section>

      <Section variant="card" className="bg-white">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          최근 주문
        </h2>
        <SalesRecentOrders
          recentOrders={data?.recentOrders ?? []}
          isLoading={isLoading}
        />
      </Section>
    </div>
  );
}
