'use client';

import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Store,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

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

function LoadingSpinner() {
  return (
    <div
      className="flex min-h-[calc(100vh-64px)] items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="로딩 중"
    >
      <div className="border-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      <span className="sr-only">로딩 중</span>
    </div>
  );
}

function OnboardingErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-3 px-4"
      role="alert"
      aria-live="assertive"
    >
      <p className="text-sm text-gray-500">
        상태를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <Button variant="ghost" color="gray" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}

function BenefitList() {
  return (
    <ul className="mb-8 space-y-3 rounded-xl bg-gray-50 p-4">
      {BENEFITS.map((benefit) => (
        <li key={benefit} className="flex items-center gap-3">
          <CheckCircle className="text-primary-500 h-5 w-5 shrink-0" />
          <span className="text-sm text-gray-700">{benefit}</span>
        </li>
      ))}
    </ul>
  );
}

function GuestCTA() {
  const { openAuthModal } = useAuthModal();

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
            로그인 후 판매자 신청을 완료하면 픽마의 모든 판매 기능을 이용할 수
            있어요.
          </p>
        </div>

        <BenefitList />

        <div className="space-y-3">
          <Button
            className="w-full"
            variant="filled"
            color="primary"
            onClick={() => openAuthModal('login')}
          >
            로그인하고 시작하기
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <Link href="/" className="block">
            <Button className="w-full" variant="ghost" color="gray">
              소비자 홈으로 돌아가기
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

function NotAppliedCTA() {
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
            사업자 정보와 서류를 제출하면 심사 후 판매자로 전환돼요.
          </p>
        </div>

        <BenefitList />

        <div className="space-y-3">
          <Link href="/seller/register" className="block">
            <Button className="w-full" variant="filled" color="primary">
              판매자 신청하기
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button className="w-full" variant="ghost" color="gray">
              소비자 홈으로 돌아가기
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

function PendingCTA() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            심사가 진행 중이에요
          </h1>
          <p className="text-sm leading-relaxed text-gray-500">
            제출하신 서류를 검토 중입니다. 승인까지 영업일 기준 1~3일이
            소요돼요.
          </p>
        </div>

        <div className="mb-8 rounded-xl bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
            <p className="text-sm text-yellow-800">
              심사 결과는 가입하신 이메일로 안내드립니다. 심사 상태는 심사 대기
              페이지에서도 확인할 수 있어요.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/seller/pending" className="block">
            <Button className="w-full" variant="filled" color="primary">
              심사 상태 확인하기
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button className="w-full" variant="ghost" color="gray">
              소비자 홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function RejectedCTA({ rejectReason }: { rejectReason?: string }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            판매자 신청이 반려되었어요
          </h1>
          <p className="text-sm leading-relaxed text-gray-500">
            서류를 보완하여 다시 신청해주세요.
          </p>
        </div>

        {rejectReason && (
          <div className="mb-8 rounded-xl bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="mb-1 text-sm font-medium text-red-800">
                  반려 사유
                </p>
                <p className="text-sm text-red-700">{rejectReason}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/seller/register" className="block">
            <Button className="w-full" variant="filled" color="primary">
              재신청하기
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button className="w-full" variant="ghost" color="gray">
              소비자 홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ApprovedNoStoreCTA() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="bg-primary-50 flex h-16 w-16 items-center justify-center rounded-full">
            <CheckCircle className="text-primary-500 h-8 w-8" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            판매자 승인이 완료되었어요!
          </h1>
          <p className="text-sm leading-relaxed text-gray-500">
            이제 가게를 등록하면 상품 판매를 시작할 수 있어요.
          </p>
        </div>

        <div className="mb-8 rounded-xl bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
            <p className="text-sm text-green-800">
              가게 정보(상호명, 주소, 운영 시간 등)를 등록하면 바로 운영을
              시작할 수 있어요.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/seller/store" className="block">
            <Button className="w-full" variant="filled" color="primary">
              가게 등록하러 가기
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button className="w-full" variant="ghost" color="gray">
              소비자 홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ApprovedWithStoreCTA() {
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
            이미 운영 중인 가게가 있어요
          </h1>
          <p className="text-sm leading-relaxed text-gray-500">
            대시보드에서 오늘의 주문 현황을 확인해보세요.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/seller/dashboard" className="block">
            <Button className="w-full" variant="filled" color="primary">
              대시보드로 이동
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button className="w-full" variant="ghost" color="gray">
              소비자 홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SellerPage() {
  const { data: user, isLoading: isUserLoading } = useMe();
  const {
    data: onboardingStatus,
    isLoading: isOnboardingLoading,
    isError: isOnboardingError,
    refetch: refetchOnboardingStatus,
  } = useSellerOnboardingStatus({ enabled: Boolean(user) });

  const isLoading = isUserLoading || (Boolean(user) && isOnboardingLoading);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 비로그인
  if (!user) {
    return <GuestCTA />;
  }

  // 온보딩 상태 조회 실패
  if (isOnboardingError || !onboardingStatus) {
    return (
      <OnboardingErrorFallback onRetry={() => void refetchOnboardingStatus()} />
    );
  }

  const { applicationStatus, hasStore, latestRejectReason } = onboardingStatus;

  // 승인 + 가게 있음
  if (applicationStatus === 'approved' && hasStore) {
    return <ApprovedWithStoreCTA />;
  }

  // 승인 + 가게 없음
  if (applicationStatus === 'approved' && !hasStore) {
    return <ApprovedNoStoreCTA />;
  }

  // 심사 대기
  if (applicationStatus === 'pending') {
    return <PendingCTA />;
  }

  // 반려
  if (applicationStatus === 'rejected') {
    return <RejectedCTA rejectReason={latestRejectReason} />;
  }

  return <NotAppliedCTA />;
}
