import { OrderDetailContent } from './_components/OrderDetailContent';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SellerOrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <OrderDetailContent orderId={id} />;
}
