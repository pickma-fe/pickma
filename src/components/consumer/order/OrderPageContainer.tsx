'use client';

import { useRouter } from 'next/navigation';

import {
  createPickupTimeOptions,
  isPastPickupTimeSlot,
} from '@/lib/formatPickupTime';
import { useProduct } from '@/hooks/products/useProduct';

import { OrderCheckoutPanel } from './OrderCheckoutPanel';
import { OrderProductSummary } from './OrderProductSummary';
import { OrderProgressSteps } from './OrderProgressSteps';

interface OrderPageContainerProps {
  productId: string;
  searchParams: {
    quantity?: string | string[];
    pickupStart?: string | string[];
    pickupEnd?: string | string[];
  };
}

const SERVICE_FEE = 0;

function getSearchParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getInitialQuantity(value: string | undefined, availableStock: number) {
  if (availableStock <= 0) {
    return 0;
  }

  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity < 1) {
    return 1;
  }

  return Math.min(quantity, availableStock);
}

function getInitialPickupTime({
  pickupStartTime,
  pickupEndTime,
  pickupStart,
  pickupEnd,
}: {
  pickupStartTime: string;
  pickupEndTime: string;
  pickupStart?: string;
  pickupEnd?: string;
}) {
  const now = new Date();
  const pickupTimeOptions = createPickupTimeOptions(
    pickupStartTime,
    pickupEndTime
  );
  const matchedPickupTime = pickupTimeOptions.find(
    (option) => option.startAt === pickupStart && option.endAt === pickupEnd
  );

  if (
    matchedPickupTime &&
    !isPastPickupTimeSlot(matchedPickupTime.startAt, pickupStartTime, now)
  ) {
    return matchedPickupTime;
  }

  return null;
}

export function OrderPageContainer({
  productId,
  searchParams,
}: OrderPageContainerProps) {
  const router = useRouter();
  const { data: product, isError, isLoading } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-gray-500">
        <p role="status" aria-live="polite">
          주문 정보를 불러오는 중입니다.
        </p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-gray-500">
        <p role="alert" aria-live="assertive">
          주문할 상품 정보를 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  const quantity = getInitialQuantity(
    getSearchParamValue(searchParams.quantity),
    product.availableStock
  );
  const initialPickupTime = getInitialPickupTime({
    pickupStartTime: product.pickupStartTime,
    pickupEndTime: product.pickupEndTime,
    pickupStart: getSearchParamValue(searchParams.pickupStart),
    pickupEnd: getSearchParamValue(searchParams.pickupEnd),
  });
  const productTotalPrice = product.discountPrice * quantity;
  const originalTotalPrice = product.originalPrice * quantity;
  const discountAmount = originalTotalPrice - productTotalPrice;
  const finalPaymentPrice = productTotalPrice + SERVICE_FEE;

  const handleQuantityChange = (newQuantity: number) => {
    const clamped = Math.max(1, Math.min(product.availableStock, newQuantity));
    const params = new URLSearchParams();
    params.set('quantity', String(clamped));
    const pickupStart = getSearchParamValue(searchParams.pickupStart);
    const pickupEnd = getSearchParamValue(searchParams.pickupEnd);
    if (pickupStart) params.set('pickupStart', pickupStart);
    if (pickupEnd) params.set('pickupEnd', pickupEnd);
    router.replace(`/order/${productId}?${params.toString()}`);
  };

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
          initialPickupTime={initialPickupTime}
        />
      </aside>
    </div>
  );
}
