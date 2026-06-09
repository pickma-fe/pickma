'use client';

import type { User } from '@/types/user';
import { Badge } from '@/components/common/Badge/Badge';
import { AdminTable } from '@/app/(admin)/admin/_components/AdminTable';

import {
  formatAdminUserDate,
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
} from './adminUserUtils';

interface AdminUserTableProps {
  users: User[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminUserTable({
  users,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: AdminUserTableProps) {
  return (
    <AdminTable
      data={users}
      rowKey={(user) => user.id}
      isLoading={isLoading}
      emptyMessage="조건에 맞는 사용자가 없습니다."
      pagination={{
        currentPage,
        totalPages,
        onPageChange,
      }}
      columns={[
        {
          key: 'createdAt',
          header: '가입일',
          render: (user) => (
            <span className="text-gray-600">
              {formatAdminUserDate(user.createdAt)}
            </span>
          ),
        },
        {
          key: 'name',
          header: '사용자',
          render: (user) => (
            <div className="min-w-52">
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="mt-1 text-xs text-gray-500">{user.email}</p>
            </div>
          ),
        },
        {
          key: 'phone',
          header: '연락처',
          render: (user) => user.phone ?? '등록된 연락처 없음',
        },
        {
          key: 'role',
          header: '역할',
          render: (user) => (
            <Badge color={user.role === 'admin' ? 'info' : 'gray'} rounded="md">
              {USER_ROLE_LABELS[user.role]}
            </Badge>
          ),
        },
        {
          key: 'status',
          header: '계정 상태',
          render: (user) => (
            <Badge
              color={user.status === 'active' ? 'success' : 'warning'}
              rounded="md"
            >
              {USER_STATUS_LABELS[user.status]}
            </Badge>
          ),
        },
      ]}
    />
  );
}
