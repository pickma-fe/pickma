import { notFound } from 'next/navigation';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServerClient } from '@/lib/supabase/server';
import { mapProductDetail } from '@/api/products/productMapper';
import { ProductDetailContainer } from '@/components/consumer/ProductDetailContainer';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { productIdSchema } from '@/app/api/products/_lib/schemas';
import { getProductById } from '@/app/api/products/_lib/service';
import { mockProductDetailsMap } from '@/mocks/products';

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
  if (isApiMockEnabled()) {
    const product = mockProductDetailsMap[productId];

    if (!product) {
      notFound();
    }

    return mapProductDetail(product);
  }

  try {
    const supabase = await createServerClient();
    const product = await getProductById(supabase, productId);

    return mapProductDetail(product);
  } catch (error) {
    if (
      error instanceof AppError &&
      error.code === ERROR_CODE.PRODUCT_NOT_FOUND
    ) {
      notFound();
    }

    throw error;
  }
}
