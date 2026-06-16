import { OrderPageContainer } from '@/components/consumer/order/OrderPageContainer';

interface OrderPageProps {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{
    quantity?: string | string[];
    pickupStart?: string | string[];
    pickupEnd?: string | string[];
  }>;
}

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const { productId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <main className="flex-1 bg-white">
      <section className="mx-auto max-w-450 px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">주문/결제</h1>

        <OrderPageContainer
          productId={productId}
          searchParams={resolvedSearchParams}
        />
      </section>
    </main>
  );
}
