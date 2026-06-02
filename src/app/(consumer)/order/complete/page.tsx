import Link from 'next/link';

import { Footer, Header } from '@/components/common';

interface OrderCompletePageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function OrderCompletePage({
  searchParams,
}: OrderCompletePageProps) {
  const { orderNumber } = await searchParams;

  return (
    <div className="bg-white">
      <Header user={null} logoHref="/" />

      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-white px-6 py-20">
        <section className="w-full max-w-lg rounded-lg border border-gray-200 bg-white px-8 py-12 text-center shadow-sm">
          <div
            className="bg-primary-50 text-primary-500 mx-auto flex size-16 items-center justify-center rounded-full text-3xl font-black"
            aria-hidden="true"
          >
            ✓
          </div>

          <h1 className="mt-8 text-3xl font-bold text-gray-900">
            결제가 완료되었습니다
          </h1>
          <p className="mt-4 text-sm leading-6 text-gray-500">
            예약이 정상적으로 확정되었습니다. 픽업 시간에 맞춰 매장을 방문해
            주세요.
          </p>

          {orderNumber ? (
            <dl className="mt-8 rounded-md bg-gray-50 px-5 py-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="font-medium text-gray-500">주문번호</dt>
                <dd className="font-semibold text-gray-900">{orderNumber}</dd>
              </div>
            </dl>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-sm border border-gray-300 px-4 py-3 font-medium text-gray-900 transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              홈으로
            </Link>
            <Link
              href="/mypage?view=reservations"
              className="bg-primary-500 hover:bg-primary-600 inline-flex items-center justify-center rounded-sm border border-transparent px-4 py-3 font-medium text-white transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              내 예약 보기
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
