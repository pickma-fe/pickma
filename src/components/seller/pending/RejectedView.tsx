import { XCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button/Button';

interface RejectedViewProps {
  rejectReason?: string;
}

export function RejectedView({ rejectReason }: RejectedViewProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <XCircleIcon className="h-8 w-8 text-red-500" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-gray-900">
          심사가 반려되었습니다
        </h1>
        <p className="text-sm text-gray-500">
          제출하신 서류 심사가 반려되었습니다.
          <br />
          아래 사유를 확인 후 재신청해주세요.
        </p>
      </div>

      {rejectReason && (
        <div className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-4 text-left">
          <p className="text-xs font-medium text-red-700">반려 사유</p>
          <p className="mt-1 text-sm text-red-600">{rejectReason}</p>
        </div>
      )}

      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
        <p className="text-xs font-medium text-gray-700">📋 재신청 안내</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-gray-500">
          <li>반려 사유를 확인하고 서류를 보완해주세요.</li>
          <li>재신청은 판매자 등록 페이지에서 가능합니다.</li>
          <li>추가 문의는 고객센터를 이용해주세요.</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => router.push('/seller/register')}>
          재신청하기
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
    </div>
  );
}
