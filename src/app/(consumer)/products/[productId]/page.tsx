import { ProductDetailContainer } from '@/components/consumer/ProductDetailContainer';

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { productId } = await params;
  return <ProductDetailContainer productId={productId} />;
}
