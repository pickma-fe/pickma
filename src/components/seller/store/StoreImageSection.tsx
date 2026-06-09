import Image from 'next/image';

import type { MyStore } from '@/types/store';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

interface StoreImageSectionProps {
  storeInfo: MyStore;
  onEditImage: () => void;
}

export function StoreImageSection({
  storeInfo,
  onEditImage,
}: StoreImageSectionProps) {
  const renderImage = () => {
    if (!storeInfo.image) {
      return (
        <div className="flex h-full items-center justify-center text-gray-400">
          이미지 없음
        </div>
      );
    }

    return (
      <Image
        src={storeInfo.image}
        alt={storeInfo.name}
        fill
        className="object-cover"
        unoptimized={storeInfo.image.startsWith('blob:')}
      />
    );
  };

  return (
    <Section variant="card" className="bg-white">
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        대표 이미지
      </h3>
      <div className="flex flex-col gap-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
          {renderImage()}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            권장 사이즈 800x600px / JPG, PNG 파일 / 5MB 이하
          </p>
          <Button
            variant="outline"
            color="gray"
            className="text-sm"
            onClick={onEditImage}
          >
            이미지 변경
          </Button>
        </div>
      </div>
    </Section>
  );
}
