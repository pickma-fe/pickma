import type { ReactNode } from 'react';

import type { ProductDetailResponse } from '@/contracts/product';
import { formatPickupTime } from '@/lib/formatPickupTime';
import { Badge } from '@/components/common';

interface ProductDetailInfoProps {
  product: ProductDetailResponse;
}

function getProductStatus(product: ProductDetailResponse) {
  if (product.isSoldOut || product.displayStatus === 'soldOut') {
    return { label: '품절', color: 'gray' as const };
  }

  if (
    product.isExpired ||
    product.displayStatus === 'expired' ||
    product.displayStatus === 'closed' ||
    product.status === 'closed'
  ) {
    return { label: '마감', color: 'dark' as const };
  }

  if (product.availableStock <= 0) {
    return { label: '재고 없음', color: 'gray' as const };
  }

  return { label: '예약 가능', color: 'primary' as const };
}

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  const status = getProductStatus(product);
  const availableStock = Math.max(0, product.availableStock);

  return (
    <section aria-labelledby="product-detail-title">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge color="primary" rounded="md">
          픽마 추천
        </Badge>
        <Badge color={status.color} rounded="md">
          {status.label}
        </Badge>
      </div>

      <p className="mb-2 text-2xl font-semibold text-gray-700">
        {product.store.name}
      </p>
      <h1
        id="product-detail-title"
        className="text-4xl leading-tight font-bold text-gray-900"
      >
        {product.name}
      </h1>

      {product.description && (
        <p className="mt-5 text-sm leading-6 text-gray-700">
          {product.description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
        <strong className="text-primary-500 text-4xl font-bold">
          {product.discountPrice.toLocaleString()}원
        </strong>
        <span className="text-lg text-gray-400 line-through">
          {product.originalPrice.toLocaleString()}원
        </span>
        <span className="text-primary-500 text-lg font-bold">
          {product.discountRate}%
        </span>
      </div>

      <Badge className="mt-3" color="primary" rounded="md">
        픽마가
      </Badge>

      <p className="mt-3 text-sm text-gray-500">
        픽업 상품은 지정한 시간에 매장에서 수령해 주세요.
      </p>

      <dl className="mt-8 space-y-5 border-t border-gray-200 pt-6 text-lg">
        <ProductInfoRow label="판매처">{product.store.name}</ProductInfoRow>
        <ProductInfoRow label="픽업 가능">
          <span className="block">
            {formatPickupTime(product.pickupStartTime)} ~{' '}
            {formatPickupTime(product.pickupEndTime)}
          </span>
        </ProductInfoRow>
        <ProductInfoRow label="픽업장소">
          {product.store.address}
          {product.store.addressDetail ? ` ${product.store.addressDetail}` : ''}
        </ProductInfoRow>
        <ProductInfoRow label="남은 수량">
          {availableStock}개
        </ProductInfoRow>
      </dl>
    </section>
  );
}

interface ProductInfoRowProps {
  label: string;
  children: ReactNode;
}

function ProductInfoRow({ label, children }: ProductInfoRowProps) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4">
      <dt className="font-semibold text-gray-500">{label}</dt>
      <dd className="text-gray-900">{children}</dd>
    </div>
  );
}
