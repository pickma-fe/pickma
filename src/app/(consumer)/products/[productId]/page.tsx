import { notFound } from 'next/navigation';

import { Footer, Header } from '@/components/common';
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
            <div>
              <span className="bg-primary-50 text-primary-500 mb-4 inline-flex rounded-sm px-3 py-1 text-xs font-semibold">
                픽마 추천
              </span>

              <p className="mb-2 text-base font-semibold text-gray-700">
                {product.store.name}
              </p>
              <h1 className="text-3xl leading-tight font-bold text-gray-900">
                {product.name}
              </h1>

              <p className="mt-5 text-sm leading-6 text-gray-700">
                {product.description ?? '상품 상세 설명 영역'}
              </p>

              <div className="mt-6 flex items-end gap-3">
                <strong className="text-primary-500 text-3xl font-bold">
                  {product.discountPrice.toLocaleString()}원
                </strong>
                <span className="text-sm text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()}원
                </span>
                <span className="text-primary-500 text-sm font-bold">
                  {product.discountRate}%
                </span>
              </div>

              <dl className="mt-8 space-y-4 border-t border-gray-200 pt-6 text-sm">
                <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4">
                  <dt className="font-semibold text-gray-500">판매처</dt>
                  <dd className="text-gray-900">{product.store.name}</dd>
                </div>
                <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4">
                  <dt className="font-semibold text-gray-500">픽업장소</dt>
                  <dd className="text-gray-900">
                    {product.store.address}
                    {product.store.addressDetail
                      ? ` ${product.store.addressDetail}`
                      : ''}
                  </dd>
                </div>
                <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4">
                  <dt className="font-semibold text-gray-500">남은 수량</dt>
                  <dd className="text-gray-900">{product.availableStock}개</dd>
                </div>
              </dl>
            </div>
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
