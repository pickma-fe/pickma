'use client';

import { useMemo, useState } from 'react';

import type { StoreStatus } from '@/types/store';
import {
  type AdminStoresQuery,
  useAdminStores,
} from '@/hooks/admin/stores/useAdminStores';
import { Button } from '@/components/common/Button/Button';

import { AdminStoreFilters } from './AdminStoreFilters';
import { AdminStoreTable } from './AdminStoreTable';

const PAGE_SIZE = 10;

export function AdminStoresPageContent() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'' | StoreStatus>('');
  const [region, setRegion] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [submittedStatus, setSubmittedStatus] = useState<'' | StoreStatus>('');
  const [submittedRegion, setSubmittedRegion] = useState('');
  const trimmedSubmittedKeyword = submittedKeyword.trim();
  const trimmedSubmittedRegion = submittedRegion.trim();

  const query = useMemo<AdminStoresQuery>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(trimmedSubmittedKeyword.length > 0 && {
        keyword: trimmedSubmittedKeyword,
      }),
      ...(submittedStatus && { status: submittedStatus }),
      ...(trimmedSubmittedRegion.length > 0 && {
        region: trimmedSubmittedRegion,
      }),
    }),
    [page, submittedStatus, trimmedSubmittedKeyword, trimmedSubmittedRegion]
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useAdminStores(query);
  const stores = data?.items ?? [];
  const hasSubmittedFilters =
    trimmedSubmittedKeyword.length > 0 ||
    Boolean(submittedStatus) ||
    trimmedSubmittedRegion.length > 0;
  const countLabel = hasSubmittedFilters ? '조건에 맞는 가게' : '전체 가게';

  function submitFilters() {
    setSubmittedKeyword(keyword);
    setSubmittedStatus(status);
    setSubmittedRegion(region);
    setPage(1);
  }

  function resetFilters() {
    setKeyword('');
    setStatus('');
    setRegion('');
    setSubmittedKeyword('');
    setSubmittedStatus('');
    setSubmittedRegion('');
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">전체 가게</h1>
        <p className="mt-2 text-sm text-gray-500">
          플랫폼에 등록된 가게의 상태와 운영 정보를 확인할 수 있습니다.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">
          {countLabel} {data?.totalCount ?? 0}건
        </p>
      </section>

      <AdminStoreFilters
        keyword={keyword}
        status={status}
        region={region}
        onKeywordChange={setKeyword}
        onStatusChange={setStatus}
        onRegionChange={setRegion}
        onSubmit={submitFilters}
        onReset={resetFilters}
      />

      {isError ? (
        <div
          role="alert"
          className="rounded-md border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700"
        >
          <p className="font-medium">가게 목록을 불러오지 못했습니다.</p>
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
        <AdminStoreTable
          stores={stores}
          isLoading={isLoading || isFetching}
          currentPage={data?.page ?? page}
          totalPages={data?.totalPages ?? 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
