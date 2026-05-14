import type { ReactNode } from 'react';

import { Pagination } from '@/components/common/Pagination/Pagination';

interface Column<T> {
  key: string;
  header: string;
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
        <td
          colSpan={columns.length}
          className="px-6 py-10 text-center text-sm text-gray-500"
        >
          불러오는 중...
        </td>
      </tr>
    );
  }

  if (data.length === 0) {
    return (
      <tr>
        <td
          colSpan={columns.length}
          className="px-6 py-10 text-center text-sm text-gray-500"
        >
          {emptyMessage}
        </td>
      </tr>
    );
  }

  return data.map((item) => (
    <tr key={rowKey(item)} className="hover:bg-gray-50">
      {columns.map((col) => (
        <td
          key={col.key}
          className="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
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
}: AdminTableProps<T>) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
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
        <div className="mt-4">
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
