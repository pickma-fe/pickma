'use client';

import type { ProductDetail } from '@/types/product';
import { useProduct } from '@/hooks/products/useProduct';
import { Footer } from '@/components/common';

import { ConsumerHeader } from './ConsumerHeader';
import { ProductDetailInfo } from './ProductDetailInfo';
import { ProductDetailTabs } from './ProductDetailTabs';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductReservationPanel } from './ProductReservationPanel';

interface ProductDetailContainerProps {
  productId: string;
  initialProduct: ProductDetail;
}

export function ProductDetailContainer({
  productId,
  initialProduct,
}: ProductDetailContainerProps) {
  const {
    data: product = initialProduct,
    isError,
    isFetching,
    isLoading,
  } = useProduct(productId, initialProduct);

  if (isLoading) {
    return (
      <div className="bg-white">
        <ConsumerHeader />
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-sm font-medium text-gray-500">
            상품 정보를 불러오는 중입니다.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError && !product) {
    return (
      <div className="bg-white">
        <ConsumerHeader />
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-sm font-medium text-gray-500">
            상품 정보를 불러오지 못했습니다.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ConsumerHeader />

      <main className="min-h-screen bg-white">
        <div aria-live="polite" className="mx-auto max-w-450 px-6 pt-4">
          {isFetching ? (
            <p className="bg-primary-50 text-primary-500 rounded-md px-4 py-3 text-sm font-medium">
              상품 정보를 최신 상태로 확인하는 중입니다.
            </p>
          ) : null}
          {isError ? (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
              최신 상품 정보를 불러오지 못해 이전 정보를 표시합니다.
            </p>
          ) : null}
        </div>

        <section className="mx-auto grid max-w-450 gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="grid gap-8 xl:grid-cols-[560px_minmax(0,1fr)]">
            <ProductImageGallery
              productName={product.name}
              imageUrl={product.image}
            />

            <ProductDetailInfo product={product} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ProductReservationPanel
              price={product.discountPrice}
              availableStock={product.availableStock}
              pickupStartTime={product.pickupStartTime}
              pickupEndTime={product.pickupEndTime}
            />
          </aside>
        </section>

        <ProductDetailTabs product={product} />
      </main>

      <Footer />
    </div>
  );
}
