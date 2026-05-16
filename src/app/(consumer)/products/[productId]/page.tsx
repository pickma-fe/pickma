import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import type { ApiSuccess } from '@/contracts/common';
import type { ProductDetailResponse } from '@/contracts/product';
import { mapProductDetail } from '@/api/products/productMapper';
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

  const product = await getProductDetailOrNotFound(parsed.data);

  return (
    <ProductDetailContainer productId={parsed.data} initialProduct={product} />
  );
}

async function getProductDetailOrNotFound(productId: string) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host');

  if (!host) {
    throw new Error('Missing request host');
  }

  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http';
  const response = await fetch(
    `${protocol}://${host}/api/products/${productId}`,
    {
      cache: 'no-store',
    }
  );

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error('Failed to fetch product detail');
  }

  const body = (await response.json()) as ApiSuccess<ProductDetailResponse>;
  return mapProductDetail(body.data);
}
