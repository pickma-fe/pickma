import type { ReactNode } from 'react';

import { Pagination } from '@/components/common/Pagination/Pagination';

type Align = 'left' | 'center' | 'right';

const ALIGN_CLASS: Record<Align, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

interface Column<T> {
  key: string;
  header: string;
  headerAlign?: Align;
  align?: Align;
  render: (item: T) => ReactNode;
}

interface AdminTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: AdminTablePaginationProps;
  ariaLabel?: string;
}

function TableBody<T>({
  columns,
  data,
  rowKey,
  isLoading,
  emptyMessage,
}: Pick<
  AdminTableProps<T>,
  'columns' | 'data' | 'rowKey' | 'isLoading' | 'emptyMessage'
>) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-8 sm:px-6 sm:py-10">
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg bg-gray-50 px-4 py-5 text-center text-sm text-gray-600"
          >
            관리자 데이터를 불러오는 중입니다.
          </div>
        </td>
      </tr>
    );
  }

  if (data.length === 0) {
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-8 sm:px-6 sm:py-10">
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center">
            <p className="text-sm font-medium text-gray-700">{emptyMessage}</p>
            <p className="mt-1 text-xs text-gray-500">
              검색 조건을 조정하거나 다른 페이지를 확인해보세요.
            </p>
          </div>
        </td>
      </tr>
    );
  }

  return data.map((item) => (
    <tr key={rowKey(item)} className="align-top hover:bg-gray-50">
      {columns.map((col) => (
        <td
          key={col.key}
          className={`px-4 py-4 text-sm break-keep text-gray-900 sm:px-6 ${ALIGN_CLASS[col.align ?? 'left']}`}
        >
          {col.render(item)}
        </td>
      ))}
    </tr>
  ));
}

export function AdminTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyMessage = '데이터가 없습니다.',
  pagination,
  ariaLabel = '관리자 데이터 테이블',
}: AdminTableProps<T>) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 sm:hidden">
        표가 길면 좌우로 스크롤해서 내용을 확인할 수 있습니다.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table
          aria-label={ariaLabel}
          aria-busy={isLoading}
          className="min-w-full divide-y divide-gray-200 bg-white"
        >
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase sm:px-6 ${ALIGN_CLASS[col.headerAlign ?? 'left']}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <TableBody
              columns={columns}
              data={data}
              rowKey={rowKey}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
            />
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
