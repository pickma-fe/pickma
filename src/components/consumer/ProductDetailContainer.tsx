'use client';

import { useProduct } from '@/hooks/products/useProduct';
import { Footer } from '@/components/common';

import { ConsumerHeader } from './ConsumerHeader';
import { ProductDetailInfo } from './ProductDetailInfo';
import { ProductDetailTabs } from './ProductDetailTabs';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductReservationPanel } from './ProductReservationPanel';
import { RecentProductTracker } from './RecentProductTracker';

interface ProductDetailContainerProps {
  productId: string;
}

function getStatusMessage(params: { isFetching: boolean; isError: boolean }) {
  if (params.isFetching) {
    return {
      role: 'status' as const,
      className: 'bg-primary-50 text-primary-500',
      text: '상품 정보를 최신 상태로 확인하는 중입니다.',
    };
  }

  if (params.isError) {
    return {
      role: 'alert' as const,
      className: 'bg-red-50 text-red-500',
      text: '최신 상품 정보를 불러오지 못해 이전 정보를 표시합니다.',
    };
  }

  return null;
}

export function ProductDetailContainer({
  productId,
}: ProductDetailContainerProps) {
  const {
    data: product,
    isError,
    isFetching,
    isLoading,
  } = useProduct(productId);
  const statusMessage = getStatusMessage({ isFetching, isError });

  if (isLoading) {
    return (
      <div className="bg-white">
        <ConsumerHeader />
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p
            role="status"
            aria-live="polite"
            className="text-sm font-medium text-gray-500"
          >
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
          <p
            role="alert"
            aria-live="assertive"
            className="text-sm font-medium text-gray-500"
          >
            상품 정보를 불러오지 못했습니다.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white">
        <ConsumerHeader />
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-sm font-medium text-gray-500">
            상품 정보를 확인할 수 없습니다.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <RecentProductTracker
        id={product.id}
        name={product.name}
        imageUrl={product.image}
      />

      <ConsumerHeader />

      <main className="min-h-screen bg-white">
        {statusMessage ? (
          <div className="mx-auto max-w-450 px-6 pt-4">
            <p
              role={statusMessage.role}
              aria-live={
                statusMessage.role === 'alert' ? 'assertive' : 'polite'
              }
              className={[
                'rounded-md px-4 py-3 text-sm font-medium',
                statusMessage.className,
              ].join(' ')}
            >
              {statusMessage.text}
            </p>
          </div>
        ) : null}

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
              productId={product.id}
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
