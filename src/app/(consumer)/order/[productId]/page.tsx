import { notFound } from 'next/navigation';

import { Footer, Header } from '@/components/common';
import {
  OrderCheckoutPanel,
  OrderProductSummary,
  OrderProgressSteps,
} from '@/components/consumer/order';
import { mockProductDetailsMap } from '@/mocks/products';

interface OrderPageProps {
  params: Promise<{ productId: string }>;
}

const ORDER_QUANTITY = 1;
const SERVICE_FEE = 0;

export default async function OrderPage({ params }: OrderPageProps) {
  const { productId } = await params;
  const product = mockProductDetailsMap[productId];

  if (!product) {
    notFound();
  }

  const productTotalPrice = product.discountPrice * ORDER_QUANTITY;
  const originalTotalPrice = product.originalPrice * ORDER_QUANTITY;
  const discountAmount = originalTotalPrice - productTotalPrice;
  const finalPaymentPrice = productTotalPrice + SERVICE_FEE;

  return (
    <div className="bg-white">
      <Header user={null} logoHref="/" />

      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-450 px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-900">주문/결제</h1>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
            <div className="space-y-8">
              <OrderProgressSteps currentStep="order" />

              <OrderProductSummary
                product={product}
                quantity={ORDER_QUANTITY}
                serviceFee={SERVICE_FEE}
                productTotalPrice={productTotalPrice}
                discountAmount={discountAmount}
                finalPaymentPrice={finalPaymentPrice}
              />
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <OrderCheckoutPanel
                product={product}
                finalPaymentPrice={finalPaymentPrice}
              />
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
