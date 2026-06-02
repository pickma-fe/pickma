import type { MyStore } from '@/types/store';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

interface OperationInfoSectionProps {
  storeInfo: MyStore;
  onToggleOperation?: () => void;
  isToggling?: boolean;
}

export function OperationInfoSection({
  storeInfo,
  onToggleOperation,
  isToggling,
}: OperationInfoSectionProps) {
  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';

    // HH:mm:ss 형태의 문자열을 직접 파싱
    const [hours, minutes] = timeString.split(':');
    if (!hours || !minutes) return '-';

    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR');
  };

  const isInactive = storeInfo.status === 'inactive';
  const isOpen = storeInfo.operationStatus === 'open';

  return (
    <Section variant="card" className="bg-white">
      <h3 className="mb-4 text-base font-semibold text-gray-900">운영 정보</h3>
      <dl className="flex flex-col gap-3">
        <div className="flex items-center">
          <dt className="w-28 shrink-0 text-sm text-gray-500">가게 상태</dt>
          <dd className="flex items-center gap-3">
            <Badge
              variant="soft"
              color={storeInfo.canSell ? 'success' : 'gray'}
            >
              {storeInfo.canSell ? '판매중' : '판매중지'}
            </Badge>
            {isInactive ? (
              <span className="text-xs text-gray-400">
                관리자 비활성화 상태
              </span>
            ) : (
              <Button
                variant="outline"
                color={isOpen ? 'gray' : 'primary'}
                onClick={onToggleOperation}
                disabled={isToggling || !onToggleOperation}
              >
                {isOpen ? '영업 종료' : '영업 시작'}
              </Button>
            )}
          </dd>
        </div>
        <div className="flex">
          <dt className="w-28 shrink-0 text-sm text-gray-500">입점일</dt>
          <dd className="text-sm text-gray-900">
            {formatDate(storeInfo.createdAt)}
          </dd>
        </div>
        <div className="flex">
          <dt className="w-28 shrink-0 text-sm text-gray-500">최근 수정일</dt>
          <dd className="text-sm text-gray-900">
            {formatDate(storeInfo.updatedAt)}
          </dd>
        </div>
        <div className="flex">
          <dt className="w-28 shrink-0 text-sm text-gray-500">운영 시간</dt>
          <dd className="text-sm text-gray-900">
            {formatTime(storeInfo.openTime)} - {formatTime(storeInfo.closeTime)}
          </dd>
        </div>
      </dl>
    </Section>
  );
}
