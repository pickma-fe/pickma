'use client';

import { ChevronRight, Ticket } from 'lucide-react';
import Image from 'next/image';

import { useMe } from '@/hooks/users/useMe';
import { mockRecentlyViewedProducts } from '@/mocks/mypage';

const FALLBACK_PROFILE_IMAGE = '/images/mock/profile.jpg';

export function MypageSummaryPanel() {
  const { data: user, isError, isLoading } = useMe();
  const userName = user?.name ?? '사용자';
  const profileImage = user?.profileImage || FALLBACK_PROFILE_IMAGE;

  return (
    <aside className="space-y-12">
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-lg font-bold text-gray-900">내 정보</h2>
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-1 text-sm font-medium text-gray-400"
          >
            수정하기
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-4 px-6 py-6">
          {isLoading ? (
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-medium text-gray-500"
            >
              내 정보를 불러오는 중입니다.
            </p>
          ) : null}

          {isError ? (
            <p
              role="alert"
              aria-live="assertive"
              className="text-sm font-medium text-red-500"
            >
              내 정보를 불러오지 못했습니다.
            </p>
          ) : null}

          {!isLoading && !isError && user ? (
            <>
              <div className="bg-primary-50 relative size-16 overflow-hidden rounded-full">
                <Image
                  src={profileImage}
                  alt={`${userName} 프로필`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{userName} 님</p>
                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {user.phone ?? '등록된 전화번호가 없습니다.'}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">보유 쿠폰</h2>
        </div>

        <div className="mt-5 rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-white text-gray-400">
            <Ticket className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-700">
            쿠폰 기능은 추후 추가 예정입니다.
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-500">
            보유 쿠폰과 쿠폰함은 쿠폰 API 연동 후 제공됩니다.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">최근 본 상품</h2>
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-1 text-sm font-medium text-gray-400"
          >
            전체보기
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {mockRecentlyViewedProducts.map((product) => (
            <div key={product.id}>
              <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
