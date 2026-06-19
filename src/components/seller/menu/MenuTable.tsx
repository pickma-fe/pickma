'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import type { MenuItem } from '@/types/menu-item';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { Pagination } from '@/components/common/Pagination/Pagination';

interface MenuTableProps {
  menus: MenuItem[];
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

function MenuImageCell({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-400">
        🍽️
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="56px"
      className="object-cover"
      onError={() => setError(true)}
    />
  );
}

const PAGE_SIZE_OPTIONS = [
  { label: '5개씩 보기', value: '5' },
  { label: '10개씩 보기', value: '10' },
  { label: '20개씩 보기', value: '20' },
];

const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';
const formatDate = (date: Date) => date.toLocaleDateString('ko-KR');

export function MenuTable({
  menus,
  currentPage,
  onPageChange,
  selectedIds,
  onSelectionChange,
}: MenuTableProps) {
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(menus.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMenus = menus.slice(startIndex, startIndex + pageSize);

  const isAllSelected =
    paginatedMenus.length > 0 &&
    paginatedMenus.every((menu) => selectedIds.has(menu.id));

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    onPageChange(1);
    onSelectionChange(new Set());
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedIds);
      paginatedMenus.forEach((menu) => next.delete(menu.id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      paginatedMenus.forEach((menu) => next.add(menu.id));
      onSelectionChange(next);
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  if (menus.length === 0) {
    return (
      <div className="flex min-h-75 items-center justify-center rounded-lg border border-gray-200 bg-white">
        <div className="text-center">
          <p className="text-sm text-gray-500">등록된 메뉴가 없습니다.</p>
          <p className="text-xs text-gray-400">
            메뉴를 등록하고 판매를 시작해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">메뉴 목록</caption>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th
                scope="col"
                className="py-3 pr-4 pl-8 text-left text-sm font-medium text-gray-500"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    aria-label="전체 메뉴 선택"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                  />
                  <span>메뉴 정보</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                카테고리
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                가격
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                수정일
              </th>
              <th
                scope="col"
                className="py-3 pr-8 pl-4 text-left text-sm font-medium whitespace-nowrap text-gray-500"
              >
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedMenus.map((menu, index) => (
              <tr
                key={menu.id}
                className={`hover:bg-gray-50 ${
                  index !== paginatedMenus.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                } ${selectedIds.has(menu.id) ? 'bg-primary-50/50' : ''}`}
              >
                <td className="py-4 pr-4 pl-8">
                  <div className="flex items-center gap-7">
                    <input
                      type="checkbox"
                      aria-label={`${menu.name} 선택`}
                      checked={selectedIds.has(menu.id)}
                      onChange={() => handleSelectOne(menu.id)}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                    />
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <MenuImageCell src={menu.image} alt={menu.name} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {menu.name}
                      </p>
                      {menu.description && (
                        <p className="line-clamp-1 text-xs text-gray-500">
                          {menu.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant="soft" color="gray">
                    {menu.categoryName}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                  {formatPrice(menu.originalPrice)}
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500">
                  {formatDate(menu.updatedAt)}
                </td>
                <td className="py-4 pr-8 pl-4 whitespace-nowrap">
                  <Link href={`/seller/menu/${menu.id}/edit`}>
                    <Button variant="outline" color="gray">
                      수정
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
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
