import { notFound } from 'next/navigation';

import { ProductDetailContainer } from '@/components/consumer/ProductDetailContainer';
import { productIdSchema } from '@/app/api/products/_lib/schemas';

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { productId } = await params;
  const parsed = productIdSchema.safeParse(productId);

  if (!parsed.success) {
    notFound();
  }

  return <ProductDetailContainer productId={parsed.data} />;
}
