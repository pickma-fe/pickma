'use client';

import {
  PackageIcon,
  ShoppingBagIcon,
  StoreIcon,
  UsersIcon,
} from 'lucide-react';
import { useState } from 'react';

import type { AdminDashboardPendingApplicationSummary } from '@/types/admin';
import { useAdminDashboardStats } from '@/hooks/admin/dashboard/useAdminDashboardStats';
import { useApproveSellerApplication } from '@/hooks/admin/sellers/useApproveSellerApplication';
import { useRejectSellerApplication } from '@/hooks/admin/sellers/useRejectSellerApplication';
import { Button } from '@/components/common/Button/Button';

import { AdminDashboardDailyChart } from './AdminDashboardDailyChart';
import { AdminDashboardPendingApplications } from './AdminDashboardPendingApplications';
import { AdminDashboardRecentOrders } from './AdminDashboardRecentOrders';
import { AdminDashboardRecentUsers } from './AdminDashboardRecentUsers';
import { AdminDashboardRejectModal } from './AdminDashboardRejectModal';
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
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingActionId, setPendingActionId] = useState<string>();
  const [rejectApplication, setRejectApplication] =
    useState<AdminDashboardPendingApplicationSummary>();
  const { data, isLoading, isError, refetch, isFetching } =
    useAdminDashboardStats();
  const approveMutation = useApproveSellerApplication();
  const rejectMutation = useRejectSellerApplication();
  const stats = data ?? EMPTY_STATS;
  const isMutatingAction =
    approveMutation.isPending || rejectMutation.isPending;

  async function handleApprove(
    application: AdminDashboardPendingApplicationSummary
  ) {
    setMessage('');
    setActionError('');
    setPendingActionId(application.id);

    try {
      await approveMutation.mutateAsync(application.id);
      setMessage(`${application.companyName} 신청을 승인했습니다.`);
    } catch {
      setActionError('승인 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPendingActionId(undefined);
    }
  }

  async function handleReject(reason: string) {
    if (!rejectApplication) return;

    setMessage('');
    setActionError('');
    setPendingActionId(rejectApplication.id);

    try {
      await rejectMutation.mutateAsync({
        id: rejectApplication.id,
        reason,
      });
      setMessage(`${rejectApplication.companyName} 신청을 거절했습니다.`);
      setRejectApplication(undefined);
    } catch {
      setActionError('거절 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPendingActionId(undefined);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-sm text-gray-500">
          픽마 플랫폼의 주요 현황을 한눈에 확인하세요.
        </p>
      </header>

      {message && (
        <div
          role="status"
          className="border-primary-100 bg-primary-50 text-primary-700 rounded-md border px-4 py-3 text-sm"
        >
          {message}
        </div>
      )}
      {actionError && (
        <div
          role="alert"
          className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {actionError}
        </div>
      )}

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
          isActionPending={isMutatingAction}
          pendingActionId={pendingActionId}
          onApprove={(application) => void handleApprove(application)}
          onReject={setRejectApplication}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AdminDashboardRecentOrders orders={stats.recentOrders} />
        <AdminDashboardRecentUsers users={stats.recentUsers} />
      </section>

      <AdminDashboardRejectModal
        key={rejectApplication?.id ?? 'closed'}
        application={rejectApplication}
        isSubmitting={rejectMutation.isPending}
        onClose={() => setRejectApplication(undefined)}
        onSubmit={(reason) => void handleReject(reason)}
      />
    </div>
  );
}
