import {
  Check,
  Clock,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { Button, Footer, Header } from '@/components/common';
import { mockProductDetailsMap } from '@/mocks/products';

interface OrderPageProps {
  params: Promise<{ productId: string }>;
}

const ORDER_QUANTITY = 1;
const SERVICE_FEE = 0;
const FALLBACK_PRODUCT_IMAGE = '/images/products/bread.jpg';

function formatPickupTime(value: string) {
  const time = value.includes('T') ? value.split('T')[1] : value;
  const [hour, minute] = time.split(':');

  if (!hour || !minute) {
    return value;
  }

  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

function getPickupPlace(
  product: NonNullable<(typeof mockProductDetailsMap)[string]>
) {
  return product.store.addressDetail
    ? `${product.store.address} ${product.store.addressDetail}`
    : product.store.address;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { productId } = await params;
  const product = mockProductDetailsMap[productId];

  if (!product) {
    notFound();
  }

  const productTotalPrice = product.discountPrice * ORDER_QUANTITY;
  const originalTotalPrice = product.originalPrice * ORDER_QUANTITY;
  const discountAmount = originalTotalPrice - productTotalPrice;
  const finalPaymentPrice = productTotalPrice + SERVICE_FEE;
  const pickupPlace = getPickupPlace(product);
  const pickupTime = `${formatPickupTime(product.pickupStartTime)}~${formatPickupTime(
    product.pickupEndTime
  )}`;

  return (
    <div className="bg-white">
      <Header user={null} logoHref="/" />

      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-450 px-6 py-10">
          <p className="mb-8 text-sm font-medium text-gray-500">
            홈 &gt; 주문/결제
          </p>
          <h1 className="text-3xl font-bold text-gray-900">주문/결제</h1>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
            <div className="space-y-8">
              <OrderProgressSteps />

              <section className="rounded-lg border border-gray-200 bg-white p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">주문 상품</h2>
                  <button
                    type="button"
                    aria-label="상품 제거"
                    className="rounded-full bg-gray-100 p-1 text-gray-500"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <p className="mb-5 text-base font-bold text-gray-900">
                  {product.store.name}
                </p>

                <div className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[180px_minmax(0,1fr)_132px_120px] xl:items-center">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={product.image || FALLBACK_PRODUCT_IMAGE}
                      alt={product.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {product.description ??
                        '픽업 가능한 마감 할인 상품입니다.'}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <strong className="text-primary-500 text-xl font-bold">
                        {product.discountPrice.toLocaleString()}원
                      </strong>
                      <span className="text-sm text-gray-400 line-through">
                        {product.originalPrice.toLocaleString()}원
                      </span>
                      <span className="text-primary-500 text-sm font-bold">
                        {product.discountRate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex w-fit overflow-hidden rounded-md border border-gray-200">
                    <button
                      type="button"
                      aria-label="수량 감소"
                      disabled
                      className="flex size-10 items-center justify-center text-gray-300"
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </button>
                    <span className="flex size-10 items-center justify-center border-x border-gray-200 text-sm font-medium text-gray-900">
                      {ORDER_QUANTITY}
                    </span>
                    <button
                      type="button"
                      aria-label="수량 증가"
                      disabled
                      className="flex size-10 items-center justify-center text-gray-300"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </button>
                  </div>

                  <strong className="text-right text-lg font-bold text-gray-900">
                    {productTotalPrice.toLocaleString()}원
                  </strong>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <dl className="space-y-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-600">상품 금액</dt>
                      <dd className="font-medium text-gray-900">
                        {product.originalPrice.toLocaleString()}원
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-600">픽마 안심 서비스</dt>
                      <dd className="font-medium text-gray-900">
                        {SERVICE_FEE.toLocaleString()}원
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-primary-500">할인 금액</dt>
                      <dd className="text-primary-500 font-medium">
                        -{discountAmount.toLocaleString()}원
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-gray-200 pt-5">
                      <dt className="text-xl font-bold text-gray-900">
                        총 결제 금액
                      </dt>
                      <dd className="text-primary-500 text-xl font-bold">
                        {finalPaymentPrice.toLocaleString()}원
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-8 flex gap-3 rounded-md bg-gray-50 p-5">
                  <div className="bg-primary-100 text-primary-500 flex size-9 shrink-0 items-center justify-center rounded-full">
                    <ShieldCheck className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      픽마 안심 서비스
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      상품에 문제가 있을 경우 픽마가 100% 환불해드려요.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <section className="rounded-lg border border-gray-200 bg-white p-8">
                <OrderInfoBlock
                  icon={<MapPin className="size-5" aria-hidden="true" />}
                  title="픽업 정보"
                  actionLabel="변경"
                >
                  <p className="font-medium text-gray-900">{pickupPlace}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    매장 방문 후 주문 상품을 수령해 주세요.
                  </p>
                </OrderInfoBlock>

                <OrderInfoBlock
                  icon={<Clock className="size-5" aria-hidden="true" />}
                  title="픽업 시간"
                  actionLabel="변경"
                >
                  <p className="font-medium text-gray-900">오늘 {pickupTime}</p>
                </OrderInfoBlock>

                <OrderInfoBlock
                  icon={<CreditCard className="size-5" aria-hidden="true" />}
                  title="결제 수단"
                  actionLabel="변경"
                >
                  <p className="font-medium text-gray-900">신용/체크카드</p>
                  <p className="mt-2 text-sm text-gray-500">
                    결제 수단은 추후 연동 예정입니다.
                  </p>
                </OrderInfoBlock>

                <div className="mt-8 border-t border-gray-200 pt-7">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                      최종 결제 금액
                    </h2>
                    <strong className="text-primary-500 text-2xl font-bold">
                      {finalPaymentPrice.toLocaleString()}원
                    </strong>
                  </div>

                  <Button className="w-full py-4 text-lg font-bold">
                    {finalPaymentPrice.toLocaleString()}원 결제하기
                  </Button>

                  <p className="mt-5 text-center text-xs leading-5 text-gray-500">
                    결제 버튼을 누르면 픽마의 이용약관과 개인정보 처리방침에
                    동의하게 됩니다.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function OrderProgressSteps() {
  const steps = [
    { label: '장바구니', icon: ShoppingCart, active: true },
    { label: '주문 정보', icon: MapPin, active: false },
    { label: '결제 수단', icon: CreditCard, active: false },
    { label: '결제 완료', icon: Check, active: false },
  ];

  return (
    <ol className="grid grid-cols-4 items-start gap-3">
      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <li key={step.label} className="relative flex flex-col items-center">
            <span className="absolute top-5 right-1/2 left-0 h-px bg-gray-200" />
            {index < steps.length - 1 ? (
              <span className="absolute top-5 right-0 left-1/2 h-px bg-gray-200" />
            ) : null}
            <span
              className={[
                'relative z-10 flex size-11 items-center justify-center rounded-full border bg-white',
                step.active
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-gray-200 text-gray-600',
              ].join(' ')}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span
              className={[
                'mt-3 text-sm font-semibold',
                step.active ? 'text-primary-500' : 'text-gray-600',
              ].join(' ')}
            >
              {index + 1}. {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

interface OrderInfoBlockProps {
  icon: ReactNode;
  title: string;
  actionLabel: string;
  children: ReactNode;
}

function OrderInfoBlock({
  icon,
  title,
  actionLabel,
  children,
}: OrderInfoBlockProps) {
  return (
    <div className="border-b border-gray-200 py-7 first:pt-0">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button
          type="button"
          className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
        >
          {actionLabel}
        </button>
      </div>
      <div className="flex gap-3 text-sm">
        <span className="mt-0.5 text-gray-600">{icon}</span>
        <div>{children}</div>
      </div>
    </div>
  );
}
