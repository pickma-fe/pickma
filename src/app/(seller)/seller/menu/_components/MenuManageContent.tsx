'use client';

import { Package, PackageX, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useDeleteSellerMenuItem } from '@/hooks/seller/menu-items/useDeleteSellerMenuItem';
import { useSellerMenuItems } from '@/hooks/seller/menu-items/useSellerMenuItems';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

import { MenuFilter } from './MenuFilter';
import { MenuTable } from './MenuTable';
import { ProductRegistrationModal } from './ProductRegistrationModal';

export function MenuManageContent() {
  const { data: menuItemsData, isLoading, isError } = useSellerMenuItems();
  const menuItems = useMemo(() => menuItemsData ?? [], [menuItemsData]);
  const { mutateAsync: deleteMenuItem } = useDeleteSellerMenuItem();

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const categories = useMemo(
    () => ['전체', ...new Set(menuItems.map((m) => m.categoryName))],
    [menuItems]
  );

  const filteredMenus = useMemo(
    () =>
      menuItems.filter((menu) => {
        const matchCategory =
          selectedCategory === '전체' || menu.categoryName === selectedCategory;
        const matchSearch =
          searchKeyword === '' ||
          menu.name.toLowerCase().includes(searchKeyword.toLowerCase());
        return matchCategory && matchSearch;
      }),
    [menuItems, selectedCategory, searchKeyword]
  );

  const totalCount = menuItems.length;
  const activeCount = menuItems.filter((m) => m.status === 'active').length;
  const inactiveCount = menuItems.filter((m) => m.status === 'inactive').length;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const ids = [...selectedIds];
    const count = ids.length;
    try {
      await Promise.all(ids.map((id) => deleteMenuItem(id)));
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      showToast(`${count}개 메뉴를 삭제했습니다.`);
    } catch {
      showToast('삭제 중 오류가 발생했습니다.');
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-gray-500">
        메뉴를 불러오는 중입니다.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-red-500">
        메뉴를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          메뉴 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          등록한 메뉴를 확인하고 관리할 수 있습니다.
        </p>
      </div>
      <Section variant="card" className="bg-white">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">전체 메뉴</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCount}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">판매중</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeCount}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <PackageX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">판매중지</p>
              <p className="text-2xl font-bold text-gray-900">
                {inactiveCount}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>
        </div>
      </Section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <MenuFilter
          categories={categories}
          selectedCategory={selectedCategory}
          searchKeyword={searchKeyword}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
        />
        <div className="flex gap-2">
          <Button onClick={() => setShowProductModal(true)}>판매 등록</Button>
          <Link href="/seller/menu/new">
            <Button variant="outline" color="gray">
              + 메뉴 등록
            </Button>
          </Link>
        </div>
      </div>
      <MenuTable
        menus={filteredMenus}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
          <span className="text-sm text-gray-700">
            {selectedIds.size}개 선택됨
          </span>
          <Button
            variant="outline"
            color="danger"
            onClick={handleDeleteSelected}
          >
            삭제
          </Button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">메뉴 삭제</h3>
            <p className="mt-2 text-sm text-gray-500">
              선택한 {selectedIds.size}개 메뉴를 삭제하시겠습니까?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                color="gray"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </Button>
              <Button color="danger" onClick={handleConfirmDelete}>
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}

      <ProductRegistrationModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
