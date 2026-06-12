'use client';

import { StoreIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Product } from '@/types/product';
import { formatDistanceKm } from '@/lib/formatDistanceKm';
import { formatPickupTime } from '@/lib/formatPickupTime';

const FALLBACK_PRODUCT_IMAGE = '/images/fallback/noimage.png';

export function SearchProductListItem({ product }: { product: Product }) {
  const formattedDistance = formatDistanceKm(product.distanceKm);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        aria-label={`${product.name} 상품 상세 보기`}
        className="focus-visible:ring-primary-500 absolute inset-0 z-10 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      />

      <div className="flex gap-4 p-4">
        <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-32 sm:w-44">
          <Image
            src={product.image || FALLBACK_PRODUCT_IMAGE}
            alt={product.name}
            fill
            sizes="176px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base font-bold text-gray-900">
                {product.name}
              </h3>
              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
                  <StoreIcon
                    className="text-primary-500 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="line-clamp-1">{product.storeName}</span>
                </p>
                {formattedDistance ? (
                  <p className="shrink-0 pr-2 text-sm text-gray-500">
                    {formattedDistance}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString()}원
              </p>
              <strong className="text-primary-500 text-xl font-bold">
                {product.discountPrice.toLocaleString()}원
              </strong>
              <p className="mt-1 text-sm font-bold text-orange-500">
                {product.discountRate}% 할인
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-6">
            <span>
              픽업 {formatPickupTime(product.pickupStartTime)} ~{' '}
              {formatPickupTime(product.pickupEndTime)}
            </span>
            <span>남은 수량 {product.availableStock}개</span>
          </div>
        </div>
      </div>
    </article>
  );
}
