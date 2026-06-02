import Link from 'next/link';

import { Footer, Header } from '@/components/common';

interface OrderFailPageProps {
  searchParams: Promise<{ reason?: string }>;
}

function getFailMessage(reason?: string) {
  if (reason === 'payment_cancelled') {
    return '결제가 취소되었습니다. 주문/결제 화면에서 다시 시도해 주세요.';
  }

  return '결제 처리 중 문제가 발생했습니다. 주문/결제 화면에서 다시 시도해 주세요.';
}

export default async function OrderFailPage({
  searchParams,
}: OrderFailPageProps) {
  const { reason } = await searchParams;

  return (
    <div className="bg-white">
      <Header user={null} logoHref="/" />

      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-white px-6 py-10">
        <section className="w-full max-w-lg rounded-lg border border-gray-200 bg-white px-8 py-9 text-center shadow-sm">
          <div
            className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-3xl font-black text-red-500"
            aria-hidden="true"
          >
            !
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            결제를 완료하지 못했습니다
          </h1>
          <p className="mt-4 text-sm leading-6 text-gray-500">
            {getFailMessage(reason)}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
