import type { Store } from '@/types/store';

import { AdminTable } from './AdminTable';

interface PendingStoreTableProps {
  data: Store[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  onViewDetail: (store: Store) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function PendingStoreTable({
  data,
  isLoading,
  currentPage,
  totalPages,
  onViewDetail,
}: PendingStoreTableProps) {
  return (
    <AdminTable
      columns={[
        {
          key: 'name',
          header: '가게명',
          render: (store) => store.name,
        },
        {
          key: 'region',
          header: '지역',
          render: (store) => store.region,
        },
        {
          key: 'createdAt',
          header: '신청일',
          render: (store) => formatDate(store.createdAt),
        },
        {
          key: 'actions',
          header: '',
          render: (store) => (
            <button
              type="button"
              onClick={() => onViewDetail(store)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              상세 보기
            </button>
          ),
        },
      ]}
      data={data}
      rowKey={(store) => store.id}
      isLoading={isLoading}
      emptyMessage="승인 대기 중인 가게가 없습니다."
      pagination={{
        currentPage,
        totalPages,
        onPageChange: () => {},
      }}
    />
  );
}
