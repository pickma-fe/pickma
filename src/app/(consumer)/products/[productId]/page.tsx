import { notFound } from 'next/navigation';

import { Footer, Header } from '@/components/common';
import { ProductDetailInfo } from '@/components/consumer/ProductDetailInfo';
import { ProductDetailTabs } from '@/components/consumer/ProductDetailTabs';
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

        <ProductDetailTabs product={product} />
      </main>

      <Footer />
    </div>
  );
}
