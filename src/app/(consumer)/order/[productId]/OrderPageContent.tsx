'use client';

import { notFound, useSearchParams } from 'next/navigation';

import {
  createPickupTimeOptions,
  type PickupTimeOption,
} from '@/lib/formatPickupTime';
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

function createInitialPickupTime(
  pickupStart: string | null,
  pickupEnd: string | null,
  productPickupStartTime: string,
  productPickupEndTime: string
): PickupTimeOption | undefined {
  if (!pickupStart || !pickupEnd) {
    return undefined;
  }

  return createPickupTimeOptions(
    productPickupStartTime,
    productPickupEndTime
  ).find(
    (option) => option.startAt === pickupStart && option.endAt === pickupEnd
  );
}

export function OrderPageContent({ productId }: OrderPageContentProps) {
  const { data: product, isLoading, isError } = useProduct(productId);
  const searchParams = useSearchParams();

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
  const initialPickupTime = createInitialPickupTime(
    searchParams.get('pickupStart'),
    searchParams.get('pickupEnd'),
    product.pickupStartTime,
    product.pickupEndTime
  );
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
        />
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <OrderCheckoutPanel
          product={product}
          quantity={quantity}
          finalPaymentPrice={finalPaymentPrice}
          initialPickupTime={initialPickupTime}
        />
      </aside>
    </div>
  );
}
