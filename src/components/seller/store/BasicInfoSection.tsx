import type { MyStore } from '@/types/store';
import { Section } from '@/components/common/Section/Section';

interface BasicInfoSectionProps {
  storeInfo: MyStore;
}

export function BasicInfoSection({ storeInfo }: BasicInfoSectionProps) {
  return (
    <Section variant="card">
      <h3 className="mb-4 text-base font-semibold text-gray-900">기본 정보</h3>
      <dl className="flex flex-col gap-3">
        <div className="flex">
          <dt className="w-28 flex-shrink-0 text-sm text-gray-500">
            가게 이름
          </dt>
          <dd className="text-sm text-gray-900">{storeInfo.name}</dd>
        </div>
        <div className="flex">
          <dt className="w-28 flex-shrink-0 text-sm text-gray-500">
            사업자등록번호
          </dt>
          <dd className="text-sm text-gray-900">{storeInfo.businessNumber}</dd>
        </div>
        <div className="flex">
          <dt className="w-28 flex-shrink-0 text-sm text-gray-500">
            가게 전화번호
          </dt>
          <dd className="text-sm text-gray-900">{storeInfo.phone}</dd>
        </div>
        <div className="flex">
          <dt className="w-28 flex-shrink-0 text-sm text-gray-500">
            가게 주소
          </dt>
          <dd className="text-sm text-gray-900">
            {storeInfo.address} {storeInfo.addressDetail}
          </dd>
        </div>
        <div className="flex">
          <dt className="w-28 flex-shrink-0 text-sm text-gray-500">지역</dt>
          <dd className="text-sm text-gray-900">{storeInfo.region}</dd>
        </div>
        {storeInfo.description && (
          <div className="flex">
            <dt className="w-28 flex-shrink-0 text-sm text-gray-500">
              가게 소개
            </dt>
            <dd className="text-sm text-gray-900">{storeInfo.description}</dd>
          </div>
        )}
      </dl>
    </Section>
  );
}
