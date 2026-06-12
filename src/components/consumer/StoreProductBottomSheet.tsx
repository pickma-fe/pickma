'use client';

import { XIcon } from 'lucide-react';
import Link from 'next/link';

import type { Product } from '@/types/product';
import { Button } from '@/components/common';

interface StoreProductBottomSheetProps {
  storeId: string | null;
  products: Product[];
  onClose: () => void;
}

export function StoreProductBottomSheet({
  storeId,
  products,
  onClose,
}: StoreProductBottomSheetProps) {
  if (!storeId) return null;

  const storeName = products[0]?.storeName;

  return (
    <>
      {/* 모바일: 하단 시트 */}
      <div className="absolute inset-x-0 bottom-0 z-30 rounded-t-2xl bg-white shadow-2xl md:hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {storeName ?? '가게 정보'}
          </h2>
          <Button
            type="button"
            variant="ghost"
            color="gray"
            className="p-1"
            onClick={onClose}
            aria-label="닫기"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-72 overflow-y-auto px-4 py-3">
          <ProductList products={products} />
        </div>
      </div>

      {/* 데스크탑: 우측 사이드바 */}
      <div className="absolute inset-y-0 right-0 z-30 hidden w-80 flex-col bg-white shadow-2xl md:flex">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {storeName ?? '가게 정보'}
          </h2>
          <Button
            type="button"
            variant="ghost"
            color="gray"
            className="p-1"
            onClick={onClose}
            aria-label="닫기"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <ProductList products={products} />
        </div>
      </div>
    </>
  );
}

function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        현재 판매 중인 상품이 없습니다
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {products.map((product) => (
        <li key={product.id}>
          <Link
            href={`/products/${product.id}`}
            className="flex items-center gap-3 py-3 transition-colors hover:bg-gray-50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {product.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {product.discountPrice.toLocaleString()}원{' '}
                <span className="font-medium text-red-500">
                  {product.discountRate}%
                </span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                픽업 {product.pickupStartTime} ~ {product.pickupEndTime}
              </p>
            </div>
            <span className="shrink-0 text-xs text-gray-400">
              잔여 {product.availableStock}개
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
