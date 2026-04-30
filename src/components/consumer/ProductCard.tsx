'use client';

import { ChevronRightIcon, StoreIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { ProductListItemResponse } from '@/contracts/product';
import { isProductUnavailable } from '@/lib/product';
import { Badge, Button } from '@/components/common';

type ProductCardProps = {
  product: ProductListItemResponse;
};

// 마감 시간
function formatRemainingTime(endAt: string, now: number) {
  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(endAt).getTime() - now) / 1000)
  );

  if (remainingSeconds === 0) {
    return '마감';
  }

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `마감 ${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

function formatPickupTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

export function ProductCard({ product }: ProductCardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const isUnavailable = isProductUnavailable({ product, now });

  return (
    <article className="group relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        aria-label={`${product.name} 상품 상세 보기`}
        className="focus-visible:ring-primary-500 absolute inset-0 z-10 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      />

      <div className="relative aspect-video">
        <Image
          src={product.image ?? '/images/products/bread.jpg'}
          alt={product.name}
          fill
          sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 100vw"
          className="object-cover"
        />
        <Badge
          className="absolute top-3 left-3 px-3 py-1.5"
          variant="solid"
          color="primary"
        >
          {product.discountRate}% 할인
        </Badge>
        <Badge
          className="absolute top-3 right-3 bg-gray-900/80 px-3 py-1.5"
          variant="solid"
          color="dark"
        >
          {formatRemainingTime(product.endAt, now)}
        </Badge>
      </div>

      <div className="p-3">
        <div>
          <h3 className="line-clamp-2 text-base font-bold text-gray-900">
            {product.name}
          </h3>
        </div>

        <div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
            <StoreIcon
              className="text-primary-500 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span className="line-clamp-1">{product.storeName}</span>
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="text-xs text-gray-400 line-through">
            {product.originalPrice.toLocaleString()}원
          </span>
          <strong className="text-primary-500 text-lg font-bold">
            {product.discountPrice.toLocaleString()}원
          </strong>
          <span className="text-sm font-bold text-orange-500">
            {product.discountRate}%
          </span>
        </div>

        <div className="mt-2 text-xs">
          <p className="flex">
            <span className="w-14 shrink-0 text-gray-500">픽업 가능</span>
            <span className="font-medium text-gray-500">
              {formatPickupTime(product.pickupStartTime)} ~{' '}
              {formatPickupTime(product.pickupEndTime)}
            </span>
          </p>

          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="flex">
              <span className="w-14 shrink-0 text-gray-500">남은 수량</span>
              <span className="font-medium text-gray-500">
                {product.availableStock}개
              </span>
            </p>

            {isUnavailable ? (
              <Button
                className="relative z-20 h-7 shrink-0 rounded py-1 text-xs font-semibold disabled:text-gray-500"
                variant="ghost"
                disabled
              >
                예약 불가
              </Button>
            ) : (
              <Link
                href={`/products/${product.id}/checkout`}
                className="text-primary-500 hover:bg-primary-50 relative z-20 inline-flex h-7 shrink-0 items-center justify-center rounded border border-transparent px-4 py-1 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                예약하기
                <ChevronRightIcon className="ml-1 h-3 w-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
