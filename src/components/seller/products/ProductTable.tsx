'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { Product } from '@/types/product';
import { useUpdateSellerProduct } from '@/hooks/seller/products/useUpdateSellerProduct';
import { Badge } from '@/components/common/Badge/Badge';
import type { ActionMenuItem } from '@/components/common/Dropdown/ActionsMenu';
import { ActionsMenu } from '@/components/common/Dropdown/ActionsMenu';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { Pagination } from '@/components/common/Pagination/Pagination';

interface ProductTableProps {
  products: Product[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE_OPTIONS = [
  { label: '5개씩 보기', value: '5' },
  { label: '10개씩 보기', value: '10' },
  { label: '20개씩 보기', value: '20' },
];

const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';
const formatDate = (date: Date | undefined) =>
  (date ?? new Date()).toLocaleDateString('ko-KR');

const STATUS_BADGE: Record<
  string,
  { label: string; color: 'success' | 'danger' | 'gray' }
> = {
  active: { label: '판매중', color: 'success' },
  soldout: { label: '품절', color: 'danger' },
  closed: { label: '판매중지', color: 'gray' },
};

const getStatusBadge = (product: Product) => {
  if (product.isSoldOut) {
    return STATUS_BADGE['soldout'];
  }
  return (
    STATUS_BADGE[product.status] ?? {
      label: product.status,
      color: 'gray' as const,
    }
  );
};

export function ProductTable({
  products,
  currentPage,
  onPageChange,
}: ProductTableProps) {
  const router = useRouter();
  const [pageSize, setPageSize] = useState(10);
  const { mutate: updateProduct } = useUpdateSellerProduct();

  const totalPages = Math.ceil(products.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    onPageChange(1);
  };

  if (products.length === 0) {
    return (
      <div className="flex min-h-75 items-center justify-center rounded-lg border border-gray-200 bg-white">
        <div className="text-center">
          <p className="text-sm text-gray-500">등록된 상품이 없습니다.</p>
          <p className="text-xs text-gray-400">
            상품을 등록하고 판매를 시작해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">상품 목록</caption>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium text-gray-500"
              >
                상품 정보
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500 lg:table-cell"
              >
                카테고리
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                판매가
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                상태
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                재고
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500 xl:table-cell"
              >
                등록일
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product, index) => {
              const badge = getStatusBadge(product);

              return (
                <tr
                  key={product.id}
                  className={`hover:bg-gray-50 ${
                    index !== paginatedProducts.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            🛍️
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {product.storeName}
                        </p>
                        <p className="text-xs text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-4 whitespace-nowrap lg:table-cell">
                    <Badge variant="soft" color="gray">
                      {product.categoryName}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(product.discountPrice)}
                      </span>
                      <span className="text-xs text-green-600">
                        {product.discountRate}% 할인
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant="soft" color={badge.color}>
                      {badge.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">
                        {product.availableStock}개
                      </span>
                      <span className="text-xs text-gray-400">
                        전체 {product.stock}개
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-4 text-sm whitespace-nowrap text-gray-500 xl:table-cell">
                    {formatDate(product.updatedAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <ActionsMenu
                      aria-label={`${product.name} 관리 메뉴`}
                      items={
                        [
                          product.status === 'active'
                            ? {
                                id: 'close',
                                label: '판매중지',
                                onClick: () =>
                                  updateProduct({
                                    id: product.id,
                                    body: { status: 'closed' },
                                  }),
                              }
                            : {
                                id: 'activate',
                                label: '판매중으로 변경',
                                onClick: () =>
                                  updateProduct({
                                    id: product.id,
                                    body: { status: 'active' },
                                  }),
                              },
                          {
                            id: 'edit',
                            label: '상품 수정',
                            onClick: () =>
                              router.push(
                                `/seller/products/${product.id}/edit`
                              ),
                          },
                        ] satisfies ActionMenuItem[]
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="relative flex items-center justify-center border-t border-gray-200 px-4 py-4">
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
        <div className="absolute right-4">
          <Dropdown
            type="select"
            items={PAGE_SIZE_OPTIONS}
            value={String(pageSize)}
            onChange={handlePageSizeChange}
            placeholder="10개씩 보기"
          />
        </div>
      </div>
    </div>
  );
}
