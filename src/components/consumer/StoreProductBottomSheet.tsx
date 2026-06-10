'use client';

import { XIcon } from 'lucide-react';

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
  const storeName = products[0]?.storeName;

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-30 rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ${
        storeId ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
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
        {products.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            현재 판매 중인 상품이 없습니다
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {products.map((product) => (
              <li key={product.id} className="flex items-center gap-3 py-3">
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
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  잔여 {product.availableStock}개
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
