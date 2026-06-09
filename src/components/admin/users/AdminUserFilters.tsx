'use client';

import { RefreshCcw, Search } from 'lucide-react';

import type { UserRole, UserStatus } from '@/types/user';
import { Input } from '@/components/common/Input/Input';

import { USER_ROLE_LABELS, USER_STATUS_LABELS } from './adminUserUtils';

interface AdminUserFiltersProps {
  keyword: string;
  role: '' | UserRole;
  status: '' | UserStatus;
  onKeywordChange: (value: string) => void;
  onRoleChange: (value: '' | UserRole) => void;
  onStatusChange: (value: '' | UserStatus) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function AdminUserFilters({
  keyword,
  role,
  status,
  onKeywordChange,
  onRoleChange,
  onStatusChange,
  onSubmit,
  onReset,
}: AdminUserFiltersProps) {
  return (
    <form
      className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto_auto]"
      aria-label="관리자 사용자 필터"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="이름, 이메일, 연락처 검색"
        aria-label="사용자 검색"
        startIcon={<Search className="h-4 w-4" />}
      />
      <select
        value={role}
        onChange={(event) => onRoleChange(event.target.value as '' | UserRole)}
        aria-label="역할 선택"
        className="focus:border-primary-500 focus:ring-primary-300 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2"
      >
        <option value="">전체 역할</option>
        {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as '' | UserStatus)
        }
        aria-label="계정 상태 선택"
        className="focus:border-primary-500 focus:ring-primary-300 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2"
      >
        <option value="">전체 상태</option>
        {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-primary-500 hover:bg-primary-600 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-white"
      >
        검색
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        <RefreshCcw className="h-4 w-4" />
        초기화
      </button>
    </form>
  );
}
