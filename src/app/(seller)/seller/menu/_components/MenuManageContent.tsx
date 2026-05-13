'use client';

import { Package, ShoppingBag, PackageX } from 'lucide-react';

import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

export function MenuManageContent() {
  // TODO: API 연동 시 실제 데이터로 교체
  const stats = {
    total: 32,
    onSale: 28,
    stopped: 4,
  };

  const handleAddMenu = () => {
    // TODO: 메뉴 등록 모달 또는 페이지 이동
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          메뉴 목록
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          등록한 메뉴를 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">전체 메뉴</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>
        </Section>

        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">판매중</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.onSale}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>
        </Section>

        <Section variant="card" className="bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <PackageX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">판매중지</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.stopped}
                <span className="text-base font-normal text-gray-500">개</span>
              </p>
            </div>
          </div>
        </Section>
      </div>

      <Section variant="card" className="bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* TODO: 필터, 검색 영역 - 다음 PR */}
          </div>
          <Button onClick={handleAddMenu}>+ 메뉴 등록</Button>
        </div>

        <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              등록된 메뉴가 없습니다.
            </p>
            <p className="text-xs text-gray-400">
              메뉴를 등록하고 판매를 시작해보세요.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
