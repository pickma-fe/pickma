'use client';

import type { PickupTimeOption } from '@/lib/formatPickupTime';
import {
  createPickupTimeOptions,
  formatPickupTime,
  isPastPickupTimeSlot,
} from '@/lib/formatPickupTime';
import { useProduct } from '@/hooks/products/useProduct';
import { Footer } from '@/components/common';
import { ConsumerHeader } from '@/components/consumer/ConsumerHeader';

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

function getDefaultPickupTimeOption(
  pickupStartTime: string,
  pickupEndTime: string
): PickupTimeOption {
  const startAt = formatPickupTime(pickupStartTime);
  const endAt = formatPickupTime(pickupEndTime);

  return {
    label: `${startAt}~${endAt}`,
    startAt,
    endAt,
  };
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

  const firstAvailablePickupTime = pickupTimeOptions.find(
    (option) => !isPastPickupTimeSlot(option.startAt, pickupStartTime, now)
  );

  return (
    firstAvailablePickupTime ??
    getDefaultPickupTimeOption(pickupStartTime, pickupEndTime)
  );
}

export function OrderPageContainer({
  productId,
  searchParams,
}: OrderPageContainerProps) {
  const { data: product, isError, isLoading } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="bg-white">
        <ConsumerHeader />
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p
            role="status"
            aria-live="polite"
            className="text-sm font-medium text-gray-500"
          >
            주문 정보를 불러오는 중입니다.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="bg-white">
        <ConsumerHeader />
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p
            role="alert"
            aria-live="assertive"
            className="text-sm font-medium text-gray-500"
          >
            주문할 상품 정보를 불러오지 못했습니다.
          </p>
        </main>
        <Footer />
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

  return (
    <div className="bg-white">
      <ConsumerHeader />

      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-450 px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-900">주문/결제</h1>

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
        </section>
      </main>

      <Footer />
    </div>
  );
}
