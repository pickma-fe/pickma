'use client';

import { Minus, Plus, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

import type { ProductDetail } from '@/types/product';

interface OrderProductSummaryProps {
  product: ProductDetail;
  quantity: number;
  serviceFee: number;
  productTotalPrice: number;
  discountAmount: number;
  finalPaymentPrice: number;
  onQuantityChange: (quantity: number) => void;
}

const FALLBACK_PRODUCT_IMAGE = '/images/fallback/bread.jpg';

export function OrderProductSummary({
  product,
  quantity,
  serviceFee,
  productTotalPrice,
  discountAmount,
  finalPaymentPrice,
  onQuantityChange,
}: OrderProductSummaryProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">주문 상품</h2>
      </div>

      <p className="mb-5 text-lg font-bold text-gray-900">
        {product.store.name}
      </p>

      <div className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[180px_minmax(0,1fr)_132px_120px] xl:items-center">
        <div className="relative aspect-4/3 overflow-hidden rounded-md bg-gray-100">
          <Image
            src={product.image || FALLBACK_PRODUCT_IMAGE}
            alt={product.name}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {product.description ?? '픽업 가능한 마감 할인 상품입니다.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <strong className="text-primary-500 text-2xl font-bold">
              {product.discountPrice.toLocaleString()}원
            </strong>
            <span className="text-base text-gray-400 line-through">
              {product.originalPrice.toLocaleString()}원
            </span>
            <span className="text-primary-500 text-base font-bold">
              {product.discountRate}%
            </span>
          </div>
        </div>

        <div className="flex w-fit overflow-hidden rounded-md border border-gray-200">
          <button
            type="button"
            aria-label="수량 감소"
            disabled={quantity <= 1}
            onClick={() => onQuantityChange(quantity - 1)}
            className="focus-visible:ring-primary-500 flex size-10 items-center justify-center text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-300"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <output
            aria-label={`수량 ${quantity}개`}
            className="flex size-10 items-center justify-center border-x border-gray-200 text-sm font-medium text-gray-900"
          >
            {quantity}
          </output>
          <button
            type="button"
            aria-label="수량 증가"
            disabled={quantity >= product.availableStock}
            onClick={() => onQuantityChange(quantity + 1)}
            className="focus-visible:ring-primary-500 flex size-10 items-center justify-center text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-300"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>

        <strong className="text-right text-xl font-bold text-gray-900">
          {productTotalPrice.toLocaleString()}원
        </strong>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <dl className="space-y-1">
          <div className="flex justify-between gap-4">
            <dt className="text-base text-gray-600">상품 금액</dt>
            <dd className="text-lg font-medium text-gray-900">
              {(product.originalPrice * quantity).toLocaleString()}원
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-base text-gray-600">픽마 안심 서비스</dt>
            <dd className="text-lg font-medium text-gray-900">
              {serviceFee.toLocaleString()}원
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-primary-500 text-base">할인 금액</dt>
            <dd className="text-primary-500 text-lg font-medium">
              -{discountAmount.toLocaleString()}원
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-gray-200 pt-5">
            <dt className="text-xl font-bold text-gray-900">총 결제 금액</dt>
            <dd className="text-primary-500 text-2xl font-bold">
              {finalPaymentPrice.toLocaleString()}원
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex gap-3 rounded-md bg-gray-50 p-5">
        <div className="bg-primary-100 text-primary-500 flex size-9 shrink-0 items-center justify-center rounded-full">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">픽마 안심 서비스</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            상품에 문제가 있을 경우 픽마가 100% 환불해드려요.
          </p>
        </div>
      </div>
    </section>
  );
}
