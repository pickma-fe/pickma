'use client';

import { CheckCircle, ChevronRight, Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useSellerOnboardingStatus } from '@/hooks/seller/onboarding/useSellerOnboardingStatus';
import { useMe } from '@/hooks/users/useMe';
import { useAuthModal } from '@/components/auth/useAuthModal';
import { Button } from '@/components/common/Button/Button';

const BENEFITS = [
  '픽마 플랫폼을 통한 간편한 주문 관리',
  '오늘의 주문 현황 대시보드',
  '상품 등록 및 재고 관리',
  '가게 정보 및 메뉴 관리',
] as const;

export default function SellerPage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useMe();
  const { data: onboardingStatus, isLoading: isOnboardingLoading } =
    useSellerOnboardingStatus();
  const { openAuthModal } = useAuthModal();

  const isLoading = isUserLoading || isOnboardingLoading;

  useEffect(() => {
    if (isLoading) return;
    if (user?.role === 'seller') {
      router.replace(
        onboardingStatus?.hasStore ? '/seller/dashboard' : '/seller/store'
      );
    }
  }, [user, isLoading, onboardingStatus, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="border-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="bg-primary-50 flex h-16 w-16 items-center justify-center rounded-full">
            <Store className="text-primary-500 h-8 w-8" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            픽마에서 가게를 운영해보세요
          </h1>
          <p className="text-sm leading-relaxed text-gray-500">
            {user
              ? '가게를 등록하고 판매자로 전환하면 대시보드를 이용할 수 있어요.'
              : '로그인 후 가게를 등록하고 판매자로 전환해보세요.'}
          </p>
        </div>

        <ul className="mb-8 space-y-3 rounded-xl bg-gray-50 p-4">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <CheckCircle className="text-primary-500 h-5 w-5 shrink-0" />
              <span className="text-sm text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          {!user ? (
            <Button
              className="w-full"
              variant="filled"
              color="primary"
              onClick={() => openAuthModal('login')}
            >
              로그인하고 시작하기
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Link href="/seller/register" className="block">
              <Button className="w-full" variant="filled" color="primary">
                가게 등록 신청하기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}

          <Link href="/" className="block">
            <Button className="w-full" variant="ghost" color="gray">
              소비자센터로 돌아가기
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          가게 등록 승인까지 영업일 기준 1~3일이 소요됩니다.
        </p>
      </div>
    </div>
  );
}
