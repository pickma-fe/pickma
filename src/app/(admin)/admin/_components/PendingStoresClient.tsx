'use client';

import { usePendingAdminStores } from '@/hooks/admin/stores/usePendingAdminStores';

import { PendingStoreTable } from './PendingStoreTable';

export function PendingStoresClient() {
  const { data, isLoading, isError, refetch } = usePendingAdminStores();

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-gray-500">
        <p className="text-sm">오류가 발생했습니다.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const handleViewDetail = () => {};

  return (
    <PendingStoreTable
      data={data?.items ?? []}
      isLoading={isLoading}
      currentPage={data?.page ?? 1}
      totalPages={data?.totalPages ?? 1}
      onViewDetail={handleViewDetail}
    />
  );
}
