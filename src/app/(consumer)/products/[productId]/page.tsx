import { notFound } from 'next/navigation';

import type { ProductDetail } from '@/types/product';
import { ApiError } from '@/api/apiClient';
import { productServerApi } from '@/api/products/productServerApi';
import { ProductDetailContainer } from '@/components/consumer/ProductDetailContainer';

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

async function getInitialProduct(productId: string): Promise<ProductDetail> {
  try {
    return await productServerApi.getProduct(productId);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { productId } = await params;
  const product = await getInitialProduct(productId);

  return (
    <ProductDetailContainer productId={productId} initialProduct={product} />
  );
}
