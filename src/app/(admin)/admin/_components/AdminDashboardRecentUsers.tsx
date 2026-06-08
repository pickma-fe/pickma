import type { AdminDashboardRecentUser } from '@/types/admin';

import { AdminCard } from './AdminCard';

interface AdminDashboardRecentUsersProps {
  users: AdminDashboardRecentUser[];
}

const DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function AdminDashboardRecentUsers({
  users,
}: AdminDashboardRecentUsersProps) {
  return (
    <AdminCard title="신규 사용자">
      <ul className="divide-y divide-gray-100">
        {users.length > 0 ? (
          users.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="mt-1 truncate text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
              <p className="shrink-0 text-xs text-gray-500">
                가입일 {DATE_FORMATTER.format(user.createdAt)}
              </p>
            </li>
          ))
        ) : (
          <li className="py-6 text-sm text-gray-500">
            신규 사용자가 없습니다.
          </li>
        )}
      </ul>
    </AdminCard>
  );
}
