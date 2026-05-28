'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useSellerOnboardingStatus } from '@/hooks/seller/onboarding/useSellerOnboardingStatus';

import { PendingView } from './PendingView';
import { RejectedView } from './RejectedView';

export function PendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, isError } = useSellerOnboardingStatus();

  const devStatus =
    process.env.NODE_ENV === 'development' ? searchParams.get('status') : null;
  const devReason =
    process.env.NODE_ENV === 'development' ? searchParams.get('reason') : null;

  useEffect(() => {
    if (devStatus) return;
    if (!data) return;
    if (data.applicationStatus === 'none') {
      router.replace('/seller/register');
    }
    if (data.applicationStatus === 'approved') {
      router.replace('/seller/dashboard');
    }
  }, [data, router, devStatus]);

  if (devStatus === 'rejected') {
    return (
      <RejectedView rejectReason={devReason ?? '테스트 반려 사유입니다.'} />
    );
  }
  if (devStatus === 'pending') {
    return <PendingView />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-gray-400">
          상태를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  if (
    data.applicationStatus === 'none' ||
    data.applicationStatus === 'approved'
  ) {
    return null;
  }

  if (data.applicationStatus === 'rejected') {
    return <RejectedView rejectReason={data.latestRejectReason} />;
  }

  return <PendingView />;
}
