'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useSyncExternalStore } from 'react';

import { useMe } from '@/hooks/users/useMe';

function getMockUserCookie(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)mock_user=([^;]*)/);
  return match ? (match[1] ?? '') : '';
}

const noop = () => () => {};

export function MockUserSwitcher() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();
  const [isOpen, setIsOpen] = useState(true);
  const [, forceUpdate] = useState(0);
  const mockCookie = useSyncExternalStore(noop, getMockUserCookie, () => '');

  if (process.env.NODE_ENV !== 'development') return null;

  function setMock(value: string) {
    document.cookie = `mock_user=${value}; path=/`;
    forceUpdate((n) => n + 1);
    void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
  }

  function clearMockUser() {
    document.cookie = 'mock_user=; path=/; max-age=0';
    forceUpdate((n) => n + 1);
    void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
  }

  function statusLabel() {
    if (isLoading) return '로딩 중...';
    if (!user) return '미인증';
    if (mockCookie === 'seller_no_store') return `${user.name} (매장 없음)`;
    return `${user.name} (${user.role})`;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 z-50 rounded-full bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-gray-700"
      >
        Dev
      </button>
    );
  }

  const activeClass = 'ring-2 ring-offset-1';

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-500">Mock User</span>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="접기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>
      <span className="mb-1 truncate text-center text-xs text-gray-700">
        {statusLabel()}
      </span>
      <button
        onClick={() => setMock('admin')}
        className={`rounded px-3 py-1 text-xs font-medium text-white ${
          mockCookie === 'admin'
            ? `bg-red-700 ${activeClass} ring-red-400`
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        Admin
      </button>
      <button
        onClick={() => setMock('seller')}
        className={`rounded px-3 py-1 text-xs font-medium text-white ${
          mockCookie === 'seller'
            ? `bg-green-700 ${activeClass} ring-green-400`
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        Seller (매장 O)
      </button>
      <button
        onClick={() => setMock('seller_no_store')}
        className={`rounded px-3 py-1 text-xs font-medium text-white ${
          mockCookie === 'seller_no_store'
            ? `bg-emerald-700 ${activeClass} ring-emerald-400`
            : 'bg-emerald-500 hover:bg-emerald-600'
        }`}
      >
        Seller (매장 없음)
      </button>
      <button
        onClick={() => setMock('customer')}
        className={`rounded px-3 py-1 text-xs font-medium text-white ${
          mockCookie === 'customer'
            ? `bg-blue-700 ${activeClass} ring-blue-400`
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        Customer
      </button>
      <button
        onClick={clearMockUser}
        className="rounded bg-gray-400 px-3 py-1 text-xs font-medium text-white hover:bg-gray-500"
      >
        Clear
      </button>
    </div>
  );
}
