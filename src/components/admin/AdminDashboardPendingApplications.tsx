import Link from 'next/link';

import type { AdminDashboardPendingApplicationSummary } from '@/types/admin';

import { AdminCard } from './AdminCard';

interface AdminDashboardPendingApplicationsProps {
  applications: AdminDashboardPendingApplicationSummary[];
}

const DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function AdminDashboardPendingApplications({
  applications,
}: AdminDashboardPendingApplicationsProps) {
  return (
    <AdminCard
      title="최근 승인 대기 가게"
      action={
        <Link
          href="/admin/sellers/pending"
          className="rounded-sm text-sm font-medium text-gray-500 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          전체 보기
        </Link>
      }
    >
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
                <Link
                  href="/admin/sellers/pending"
                  className="border-primary-200 text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-500 rounded-sm border px-3 py-1.5 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  검토
                </Link>
              </div>
            </li>
          ))
        ) : (
          <li className="py-6 text-sm text-gray-500">
            현재 검토 대기 중인 가게가 없습니다.
          </li>
        )}
      </ul>
    </AdminCard>
  );
}
