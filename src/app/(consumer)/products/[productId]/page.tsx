import { notFound } from 'next/navigation';

import { Footer, Header } from '@/components/common';
import { ProductDetailInfo } from '@/components/consumer/ProductDetailInfo';
import { ProductImageGallery } from '@/components/consumer/ProductImageGallery';
import { ProductReservationPanel } from '@/components/consumer/ProductReservationPanel';
import { mockProductDetailsMap } from '@/mocks/products';

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { productId } = await params;
  const product = mockProductDetailsMap[productId];

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-white">
      <Header user={null} logoHref="/" />

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
            <ProductReservationPanel price={product.discountPrice} />
          </aside>
        </section>

        <section className="mx-auto max-w-450 px-6 pb-16">
          <div className="border-b border-gray-200">
            <nav
              className="flex gap-10"
              role="tablist"
              aria-label="상품 상세 정보"
            >
              <button
                type="button"
                role="tab"
                aria-selected="true"
                className="border-primary-500 text-primary-500 border-b-2 px-2 py-4 text-sm font-semibold"
              >
                상세정보
              </button>
              <button
                type="button"
                role="tab"
                aria-selected="false"
                className="px-2 py-4 text-sm font-semibold text-gray-600"
              >
                리뷰
              </button>
              <button
                type="button"
                role="tab"
                aria-selected="false"
                className="px-2 py-4 text-sm font-semibold text-gray-600"
              >
                매장 정보
              </button>
            </nav>
          </div>

          <div className="py-8">
            <h2 className="mb-4 text-lg font-bold text-gray-900">상품 안내</h2>
            <p className="text-sm leading-6 text-gray-700">
              상품 상세 설명 영역
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
