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
    <OrderPageContainer
      productId={productId}
      searchParams={resolvedSearchParams}
    />
  );
}
