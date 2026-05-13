'use client';

import { useProduct } from '@/hooks/products/useProduct';
import { Footer } from '@/components/common';

import { ConsumerHeader } from './ConsumerHeader';
import { ProductDetailInfo } from './ProductDetailInfo';
import { ProductDetailTabs } from './ProductDetailTabs';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductReservationPanel } from './ProductReservationPanel';

interface ProductDetailContainerProps {
  productId: string;
}

export function ProductDetailContainer({
  productId,
}: ProductDetailContainerProps) {
  const { data: product, isError, isLoading } = useProduct(productId);

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

  if (isError || !product) {
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
