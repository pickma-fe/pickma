'use client';

import { useQueryClient } from '@tanstack/react-query';

import { useMe } from '@/hooks/users/useMe';

export function MockUserSwitcher() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();

  if (process.env.NODE_ENV !== 'development') return null;

  function invalidateMe() {
    void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
  }

  function setAdmin() {
    document.cookie = 'mock_user=admin; path=/';
    invalidateMe();
  }

  function setSeller() {
    document.cookie = 'mock_user=seller; path=/';
    invalidateMe();
  }

  function setCustomer() {
    document.cookie = 'mock_user=customer; path=/';
    invalidateMe();
  }

  function clearMockUser() {
    document.cookie = 'mock_user=; path=/; max-age=0';
    invalidateMe();
  }

  const currentRole = user?.role ?? null;

  function statusLabel() {
    if (isLoading) return '로딩 중...';
    if (!user) return '미인증';
    return `${user.name} (${user.role})`;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      <span className="mb-1 text-center text-xs font-semibold text-gray-500">
        Mock User
      </span>
      <span className="mb-1 truncate text-center text-xs text-gray-700">
        {statusLabel()}
      </span>
      <button
        onClick={setAdmin}
        className={`rounded px-3 py-1 text-xs font-medium text-white ${
          currentRole === 'admin'
            ? 'bg-red-700 ring-2 ring-red-400'
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        Admin
      </button>
      <button
        onClick={setSeller}
        className={`rounded px-3 py-1 text-xs font-medium text-white ${
          currentRole === 'seller'
            ? 'bg-green-700 ring-2 ring-green-400'
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        Seller
      </button>
      <button
        onClick={setCustomer}
        className={`rounded px-3 py-1 text-xs font-medium text-white ${
          currentRole === 'customer'
            ? 'bg-blue-700 ring-2 ring-blue-400'
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
