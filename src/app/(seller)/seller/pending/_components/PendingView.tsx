import { ClockIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/common/Button/Button';

export function PendingView() {
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
          <li>심사 중에는 서류 수정이 불가합니다.</li>
          <li>문의사항은 고객센터를 이용해주세요.</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Link href="/seller/register">
          <Button variant="outline" color="gray">
            신청 내역 확인
          </Button>
        </Link>
        <Link href="/support" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" color="gray">
            고객센터
          </Button>
        </Link>
      </div>
    </div>
  );
}
