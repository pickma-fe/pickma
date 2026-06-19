'use client';

import type { Store } from '@/types/store';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/common/Badge/Badge';

import {
  formatAdminStoreDate,
  OPERATION_STATUS_LABELS,
  STORE_STATUS_LABELS,
} from './adminStoreUtils';

interface AdminStoreTableProps {
  stores: Store[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminStoreTable({
  stores,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: AdminStoreTableProps) {
  return (
    <AdminTable
      ariaLabel="관리자 가게 목록"
      data={stores}
      rowKey={(store) => store.id}
      isLoading={isLoading}
      emptyMessage="조건에 맞는 가게가 없습니다."
      pagination={{
        currentPage,
        totalPages,
        onPageChange,
      }}
      columns={[
        {
          key: 'createdAt',
          header: '등록일',
          render: (store) => (
            <span className="text-gray-600">
              {formatAdminStoreDate(store.createdAt)}
            </span>
          ),
        },
        {
          key: 'name',
          header: '가게명',
          render: (store) => (
            <div className="min-w-48">
              <p className="font-semibold text-gray-900">{store.name}</p>
              <p className="mt-1 text-xs text-gray-500">
                사업자 {store.businessNumber}
              </p>
            </div>
          ),
        },
        {
          key: 'region',
          header: '지역',
          render: (store) => (
            <span className="text-gray-700">{store.region}</span>
          ),
        },
        {
          key: 'phone',
          header: '연락처',
          render: (store) => (
            <span className="text-gray-700">{store.phone}</span>
          ),
        },
        {
          key: 'address',
          header: '주소',
          render: (store) => (
            <span className="block max-w-80 truncate" title={store.address}>
              {store.address}
            </span>
          ),
        },
        {
          key: 'status',
          header: '가게 상태',
          render: (store) => (
            <Badge
              color={store.status === 'active' ? 'success' : 'gray'}
              rounded="md"
              role="status"
              aria-label={`가게 상태: ${STORE_STATUS_LABELS[store.status]}`}
            >
              {STORE_STATUS_LABELS[store.status]}
            </Badge>
          ),
        },
        {
          key: 'operationStatus',
          header: '운영 상태',
          render: (store) => (
            <Badge
              color={store.operationStatus === 'open' ? 'info' : 'warning'}
              rounded="md"
              role="status"
              aria-label={`운영 상태: ${OPERATION_STATUS_LABELS[store.operationStatus]}`}
            >
              {OPERATION_STATUS_LABELS[store.operationStatus]}
            </Badge>
          ),
        },
      ]}
    />
  );
}
