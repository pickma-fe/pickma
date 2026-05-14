'use client';

import Link from 'next/link';

import { usePendingAdminStores } from '@/hooks/admin/stores/usePendingAdminStores';
import { Section } from '@/components/common/Section/Section';

const SUMMARY_MAX = 5;

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function AdminPendingStoreSummary() {
  const { data, isLoading, isError } = usePendingAdminStores();

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <Section variant="card" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          승인 대기 가게
          {totalCount > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalCount}건)
            </span>
          )}
        </h2>
        <Link
          href="/admin/stores/pending"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          전체 보기
        </Link>
      </div>
      {isLoading && <p className="text-sm text-gray-500">불러오는 중...</p>}
      {isError && <p className="text-sm text-red-500">불러오기 실패</p>}
      {!isLoading && !isError && items.length === 0 && (
        <p className="text-sm text-gray-500">승인 대기 중인 가게가 없습니다.</p>
      )}
      {!isLoading && !isError && items.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {items.slice(0, SUMMARY_MAX).map((store) => (
            <li
              key={store.id}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {store.name}
                </p>
                <p className="text-xs text-gray-500">{store.region}</p>
              </div>
              <p className="text-xs text-gray-400">
                {formatDate(store.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
