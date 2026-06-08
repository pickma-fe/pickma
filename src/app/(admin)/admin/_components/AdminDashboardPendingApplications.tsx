import type { AdminDashboardPendingApplicationSummary } from '@/types/admin';

import { AdminCard } from './AdminCard';

interface AdminDashboardPendingApplicationsProps {
  applications: AdminDashboardPendingApplicationSummary[];
  isActionPending: boolean;
  pendingActionId?: string;
  pendingActionType?: 'approve' | 'reject';
  onApprove: (application: AdminDashboardPendingApplicationSummary) => void;
  onReject: (application: AdminDashboardPendingApplicationSummary) => void;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function AdminDashboardPendingApplications({
  applications,
  isActionPending,
  pendingActionId,
  pendingActionType,
  onApprove,
  onReject,
}: AdminDashboardPendingApplicationsProps) {
  return (
    <AdminCard title="최근 승인 대기 가게">
      <ul className="divide-y divide-gray-100">
        {applications.length > 0 ? (
          applications.map((application) => (
            <li
              key={application.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {application.companyName}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {application.businessCategory} · 신청일{' '}
                  {DATE_FORMATTER.format(application.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={isActionPending}
                  onClick={() => onApprove(application)}
                  className="bg-primary-500 hover:bg-primary-600 rounded-sm px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                >
                  {pendingActionId === application.id &&
                  pendingActionType === 'approve'
                    ? '처리 중'
                    : '승인'}
                </button>
                <button
                  type="button"
                  disabled={isActionPending}
                  onClick={() => onReject(application)}
                  className="rounded-sm border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {pendingActionId === application.id &&
                  pendingActionType === 'reject'
                    ? '처리 중'
                    : '거절'}
                </button>
              </div>
            </li>
          ))
        ) : (
          <li className="py-6 text-sm text-gray-500">
            승인 대기 중인 가게가 없습니다.
          </li>
        )}
      </ul>
    </AdminCard>
  );
}
