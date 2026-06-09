'use client';

import type { Product } from '@/types/product';
import { Badge } from '@/components/common/Badge/Badge';
import { AdminTable } from '@/app/(admin)/admin/_components/AdminTable';

import {
  formatAdminProductDate,
  formatAdminProductPrice,
  PRODUCT_DISPLAY_STATUS_LABELS,
  PRODUCT_STATUS_LABELS,
} from './adminProductUtils';

interface AdminProductTableProps {
  products: Product[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminProductTable({
  products,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: AdminProductTableProps) {
  return (
    <AdminTable
      data={products}
      rowKey={(product) => product.id}
      isLoading={isLoading}
      emptyMessage="조건에 맞는 상품이 없습니다."
      pagination={{
        currentPage,
        totalPages,
        onPageChange,
      }}
      columns={[
        {
          key: 'name',
          header: '상품',
          render: (product) => (
            <div className="min-w-52">
              <p className="font-semibold text-gray-900">{product.name}</p>
              <p className="mt-1 text-xs text-gray-500">{product.storeName}</p>
            </div>
          ),
        },
        {
          key: 'category',
          header: '카테고리',
          render: (product) => product.categoryName ?? '-',
        },
        {
          key: 'price',
          header: '가격',
          render: (product) => (
            <div>
              <p className="font-semibold text-gray-900">
                {formatAdminProductPrice(product.discountPrice)}원
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {product.discountRate}% 할인
              </p>
            </div>
          ),
        },
        {
          key: 'stock',
          header: '재고',
          render: (product) => (
            <span>
              {product.availableStock}/{product.stock}
            </span>
          ),
        },
        {
          key: 'endAt',
          header: '마감',
          render: (product) => formatAdminProductDate(product.endAt),
        },
        {
          key: 'status',
          header: '상품 상태',
          render: (product) => (
            <div className="flex flex-col gap-1">
              <Badge
                color={product.status === 'active' ? 'success' : 'gray'}
                rounded="md"
              >
                {PRODUCT_STATUS_LABELS[product.status]}
              </Badge>
              <span className="text-xs text-gray-500">
                {PRODUCT_DISPLAY_STATUS_LABELS[product.displayStatus]}
              </span>
            </div>
          ),
        },
      ]}
    />
  );
}
