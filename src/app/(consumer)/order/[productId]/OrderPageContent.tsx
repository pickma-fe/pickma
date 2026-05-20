'use client';

import { notFound, useRouter, useSearchParams } from 'next/navigation';

import { useProduct } from '@/hooks/products/useProduct';
import {
  OrderCheckoutPanel,
  OrderProductSummary,
  OrderProgressSteps,
} from '@/components/consumer/order';

const SERVICE_FEE = 0;
const DEFAULT_ORDER_QUANTITY = 1;

interface OrderPageContentProps {
  productId: string;
}

function parseOrderQuantity(value: string | null, availableStock: number) {
  const rawQuantity = Number(value);

  if (!Number.isInteger(rawQuantity) || rawQuantity <= 0) {
    return DEFAULT_ORDER_QUANTITY;
  }

  return Math.min(rawQuantity, Math.max(availableStock, 1));
}

export function OrderPageContent({ productId }: OrderPageContentProps) {
  const { data: product, isLoading, isError } = useProduct(productId);
  const searchParams = useSearchParams();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-gray-500">
        주문 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (isError || !product) {
    notFound();
  }

  const quantity = parseOrderQuantity(
    searchParams.get('quantity'),
    product.availableStock
  );
  const pickupAt =
    searchParams.get('pickupAt') ??
    [searchParams.get('pickupStart'), searchParams.get('pickupEnd')]
      .filter(Boolean)
      .join('-');

  const handleQuantityChange = (newQuantity: number) => {
    const clamped = Math.max(1, Math.min(product.availableStock, newQuantity));
    const params = new URLSearchParams(searchParams.toString());
    params.set('quantity', String(clamped));
    router.replace(`/order/${productId}?${params.toString()}`);
  };

  const handlePickupAtChange = (newPickupAt: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pickupAt', newPickupAt);
    router.replace(`/order/${productId}?${params.toString()}`);
  };

  const productTotalPrice = product.discountPrice * quantity;
  const originalTotalPrice = product.originalPrice * quantity;
  const discountAmount = originalTotalPrice - productTotalPrice;
  const finalPaymentPrice = productTotalPrice + SERVICE_FEE;

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="space-y-8">
        <OrderProgressSteps currentStep="order" />

        <OrderProductSummary
          product={product}
          quantity={quantity}
          serviceFee={SERVICE_FEE}
          productTotalPrice={productTotalPrice}
          discountAmount={discountAmount}
          finalPaymentPrice={finalPaymentPrice}
          onQuantityChange={handleQuantityChange}
        />
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <OrderCheckoutPanel
          product={product}
          quantity={quantity}
          finalPaymentPrice={finalPaymentPrice}
          pickupAt={pickupAt}
          onPickupAtChange={handlePickupAtChange}
        />
      </aside>
    </div>
  );
}
