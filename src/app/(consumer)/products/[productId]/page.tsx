import { notFound } from 'next/navigation';

import type { ApiSuccess } from '@/contracts/common';
import type { ProductDetailResponse } from '@/contracts/product';
import { mapProductDetail } from '@/api/products/productMapper';
import { ProductDetailContainer } from '@/components/consumer/ProductDetailContainer';
import { productIdSchema } from '@/app/api/products/_lib/schemas';

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

const PRODUCT_DETAIL_FETCH_TIMEOUT_MS = 5000;

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
  const response = await fetch(`${getAppOrigin()}/api/products/${productId}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(PRODUCT_DETAIL_FETCH_TIMEOUT_MS),
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error('Failed to fetch product detail');
  }

  const body = (await response.json()) as ApiSuccess<ProductDetailResponse>;
  return mapProductDetail(body.data);
}

function getAppOrigin() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    if (process.env.NODE_ENV !== 'production') {
      return `http://localhost:${process.env.PORT ?? '3000'}`;
    }

    throw new Error('Missing NEXT_PUBLIC_APP_URL');
  }

  const origin = new URL(appUrl).origin;

  if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
    throw new Error('Invalid NEXT_PUBLIC_APP_URL');
  }

  return origin;
}
