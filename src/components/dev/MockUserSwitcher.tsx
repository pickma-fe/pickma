'use client';

import { useQueryClient } from '@tanstack/react-query';

export function MockUserSwitcher() {
  const queryClient = useQueryClient();

  if (process.env.NODE_ENV !== 'development') return null;

  function invalidateMe() {
    void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
  }

  function setAdmin() {
    document.cookie = 'mock_user=admin; path=/';
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

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      <span className="mb-1 text-center text-xs font-semibold text-gray-500">
        Mock User
      </span>
      <button
        onClick={setAdmin}
        className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
      >
        Admin
      </button>
      <button
        onClick={setCustomer}
        className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600"
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
