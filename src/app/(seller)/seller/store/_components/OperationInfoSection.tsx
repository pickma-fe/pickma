import type { MyStore } from '@/types/store';
import { Badge } from '@/components/common/Badge/Badge';
import { Section } from '@/components/common/Section/Section';

interface OperationInfoSectionProps {
  storeInfo: MyStore;
}

export function OperationInfoSection({ storeInfo }: OperationInfoSectionProps) {
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

  return (
    <Section variant="card" className="bg-white">
      <h3 className="mb-4 text-base font-semibold text-gray-900">운영 정보</h3>
      <dl className="flex flex-col gap-3">
        <div className="flex">
          <dt className="w-28 flex-shrink-0 text-sm text-gray-500">
            가게 상태
          </dt>
          <dd>
            <Badge
              variant="soft"
              color={storeInfo.canSell ? 'success' : 'gray'}
            >
              {storeInfo.canSell ? '판매중' : '판매중지'}
            </Badge>
          </dd>
        </div>
        <div className="flex">
          <dt className="w-28 flex-shrink-0 text-sm text-gray-500">입점일</dt>
          <dd className="text-sm text-gray-900">
            {formatDate(storeInfo.createdAt)}
          </dd>
        </div>
        <div className="flex">
          <dt className="w-28 flex-shrink-0 text-sm text-gray-500">
            최근 수정일
          </dt>
          <dd className="text-sm text-gray-900">
            {formatDate(storeInfo.updatedAt)}
          </dd>
        </div>
        <div className="flex">
          <dt className="w-28 flex-shrink-0 text-sm text-gray-500">
            운영 시간
          </dt>
          <dd className="text-sm text-gray-900">
            {formatTime(storeInfo.openTime)} - {formatTime(storeInfo.closeTime)}
          </dd>
        </div>
      </dl>
    </Section>
  );
}
