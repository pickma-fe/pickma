import { OrderDetailContent } from '@/components/seller/orders/OrderDetailContent';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SellerOrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <OrderDetailContent orderId={id} />;
}
