import { notFound } from 'next/navigation';

import type { PickupTimeOption } from '@/lib/formatPickupTime';
import { Footer } from '@/components/common';
import { ConsumerHeader } from '@/components/consumer/ConsumerHeader';
import {
  OrderCheckoutPanel,
  OrderProductSummary,
  OrderProgressSteps,
} from '@/components/consumer/order';
import { mockProductDetailsMap } from '@/mocks/products';

interface OrderPageProps {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{
    quantity?: string | string[];
    pickupStart?: string | string[];
    pickupEnd?: string | string[];
  }>;
}

const DEFAULT_ORDER_QUANTITY = 1;
const SERVICE_FEE = 0;

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseOrderQuantity(
  value: string | string[] | undefined,
  availableStock: number
) {
  const rawQuantity = Number(getSearchParamValue(value));

  if (!Number.isInteger(rawQuantity) || rawQuantity <= 0) {
    return DEFAULT_ORDER_QUANTITY;
  }

  return Math.min(rawQuantity, Math.max(availableStock, 1));
}

function createInitialPickupTime(
  pickupStart: string | string[] | undefined,
  pickupEnd: string | string[] | undefined
): PickupTimeOption | undefined {
  const startAt = getSearchParamValue(pickupStart);
  const endAt = getSearchParamValue(pickupEnd);

  if (!startAt || !endAt) {
    return undefined;
  }

  return {
    label: `${startAt}~${endAt}`,
    startAt,
    endAt,
  };
}

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const { productId } = await params;
  const resolvedSearchParams = await searchParams;
  const product = mockProductDetailsMap[productId];

  if (!product) {
    notFound();
  }

  const orderQuantity = parseOrderQuantity(
    resolvedSearchParams.quantity,
    product.availableStock
  );
  const initialPickupTime = createInitialPickupTime(
    resolvedSearchParams.pickupStart,
    resolvedSearchParams.pickupEnd
  );
  const productTotalPrice = product.discountPrice * orderQuantity;
  const originalTotalPrice = product.originalPrice * orderQuantity;
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
                quantity={orderQuantity}
                serviceFee={SERVICE_FEE}
                productTotalPrice={productTotalPrice}
                discountAmount={discountAmount}
                finalPaymentPrice={finalPaymentPrice}
              />
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <OrderCheckoutPanel
                product={product}
                quantity={orderQuantity}
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
