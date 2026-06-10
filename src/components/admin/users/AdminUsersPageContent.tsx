'use client';

import { useMemo, useState } from 'react';

import type { UserRole, UserStatus } from '@/types/user';
import {
  type AdminUsersQuery,
  useAdminUsers,
} from '@/hooks/admin/users/useAdminUsers';
import { Button } from '@/components/common/Button/Button';

import { AdminUserFilters } from './AdminUserFilters';
import { AdminUserTable } from './AdminUserTable';

const PAGE_SIZE = 10;

export function AdminUsersPageContent() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState<'' | UserRole>('');
  const [status, setStatus] = useState<'' | UserStatus>('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [submittedRole, setSubmittedRole] = useState<'' | UserRole>('');
  const [submittedStatus, setSubmittedStatus] = useState<'' | UserStatus>('');
  const trimmedSubmittedKeyword = submittedKeyword.trim();

  const query = useMemo<AdminUsersQuery>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(trimmedSubmittedKeyword.length > 0 && {
        keyword: trimmedSubmittedKeyword,
      }),
      ...(submittedRole && { role: submittedRole }),
      ...(submittedStatus && { status: submittedStatus }),
    }),
    [page, submittedRole, submittedStatus, trimmedSubmittedKeyword]
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useAdminUsers(query);
  const users = data?.items ?? [];
  const hasSubmittedFilters =
    trimmedSubmittedKeyword.length > 0 ||
    Boolean(submittedRole) ||
    Boolean(submittedStatus);
  const countLabel = hasSubmittedFilters ? '조건에 맞는 사용자' : '전체 사용자';

  function submitFilters() {
    setSubmittedKeyword(keyword);
    setSubmittedRole(role);
    setSubmittedStatus(status);
    setPage(1);
  }

  function resetFilters() {
    setKeyword('');
    setRole('');
    setStatus('');
    setSubmittedKeyword('');
    setSubmittedRole('');
    setSubmittedStatus('');
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p className="mt-2 text-sm text-gray-500">
          플랫폼 사용자 목록과 계정 상태를 확인할 수 있습니다.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">
          {countLabel} {data?.totalCount ?? 0}건
        </p>
      </section>

      <AdminUserFilters
        keyword={keyword}
        role={role}
        status={status}
        onKeywordChange={setKeyword}
        onRoleChange={setRole}
        onStatusChange={setStatus}
        onSubmit={submitFilters}
        onReset={resetFilters}
      />

      {isError ? (
        <div
          role="alert"
          className="rounded-md border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700"
        >
          <p className="font-medium">사용자 목록을 불러오지 못했습니다.</p>
          <Button
            variant="outline"
            color="danger"
            className="mt-3 h-9 px-3 text-xs"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <AdminUserTable
          users={users}
          isLoading={isLoading}
          currentPage={data?.page ?? page}
          totalPages={data?.totalPages ?? 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
