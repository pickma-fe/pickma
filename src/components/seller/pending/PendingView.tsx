'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { ClockIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCancelSellerApplication } from '@/hooks/seller/applications/useCancelSellerApplication';
import { Button } from '@/components/common/Button/Button';

export function PendingView() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: cancelApplication, isPending: isCancelling } =
    useCancelSellerApplication();

  function handleCancelConfirm() {
    cancelApplication(undefined, {
      onSuccess: () => {
        router.replace('/seller/register');
      },
      onError: () => {
        setShowConfirm(false);
      },
    });
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
        <ClockIcon className="h-8 w-8 text-yellow-500" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-gray-900">
          심사가 진행 중입니다
        </h1>
        <p className="text-sm text-gray-500">
          제출하신 서류를 검토 중입니다.
          <br />
          보통 영업일 기준 1~2일 내 심사가 완료됩니다.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-left">
        <p className="text-xs font-medium text-yellow-700">📋 안내사항</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-yellow-600">
          <li>심사 결과는 이메일로 안내드립니다.</li>
          <li>서류를 잘못 제출한 경우 신청을 취소하고 재신청할 수 있습니다.</li>
          <li>문의사항은 고객센터를 이용해주세요.</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          color="gray"
          onClick={() => router.push('/seller/register')}
        >
          신청 내역 확인
        </Button>
        <Button
          variant="outline"
          color="danger"
          onClick={() => setShowConfirm(true)}
        >
          신청 취소
        </Button>
        <Button
          variant="outline"
          color="gray"
          onClick={() =>
            window.open('/support', '_blank', 'noopener,noreferrer')
          }
        >
          고객센터
        </Button>
      </div>

      {/* 취소 확인 다이얼로그 */}
      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-4 text-left">
            <DialogTitle className="text-sm font-medium text-red-700">
              신청을 취소할까요?
            </DialogTitle>
            <p className="mt-1 text-xs text-red-600">
              취소 후에는 서류를 다시 제출하고 재신청해야 합니다.
              <br />
              제출된 파일은 보관 정책에 따라 자동으로 정리됩니다.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                color="danger"
                className="flex-1 text-xs"
                disabled={isCancelling}
                onClick={handleCancelConfirm}
              >
                {isCancelling ? '취소 중...' : '신청 취소 확정'}
              </Button>
              <Button
                variant="outline"
                color="gray"
                className="flex-1 text-xs"
                disabled={isCancelling}
                onClick={() => setShowConfirm(false)}
              >
                돌아가기
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
