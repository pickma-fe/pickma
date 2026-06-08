'use client';

import Image from 'next/image';

import type { SellerApplicationDocument } from '@/types/seller-application';
import { useDocumentSignedUrl } from '@/hooks/seller/applications/useDocumentSignedUrl';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';

interface CertificationDetailModalProps {
  document: SellerApplicationDocument;
  onClose: () => void;
}

const DOC_TYPE_LABEL: Record<string, string> = {
  business_license: '사업자 등록증',
  food_service_permit: '영업신고증',
  bank_account: '통장 사본',
};

export function CertificationDetailModal({
  document,
  onClose,
}: CertificationDetailModalProps) {
  const label = DOC_TYPE_LABEL[document.type] ?? document.type;

  const { data, isLoading, isError } = useDocumentSignedUrl({
    documentId: document.id,
  });

  const renderImage = () => {
    if (isLoading) {
      return (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-gray-100">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        </div>
      );
    }

    if (isError || !data?.signedUrl) {
      return (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-red-500">
          이미지를 불러올 수 없습니다
        </div>
      );
    }

    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={data.signedUrl}
          alt={label}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-contain"
          unoptimized
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <Badge variant="soft" color="success">
          제출 완료
        </Badge>
      </div>

      {renderImage()}

      <dl className="flex flex-col gap-2">
        <div className="flex">
          <dt className="w-28 shrink-0 text-sm text-gray-500">파일명</dt>
          <dd className="truncate text-sm text-gray-900">
            {document.originalFileName}
          </dd>
        </div>
        <div className="flex">
          <dt className="w-28 shrink-0 text-sm text-gray-500">제출일</dt>
          <dd className="text-sm text-gray-900">
            {new Date(document.createdAt).toLocaleDateString('ko-KR')}
          </dd>
        </div>
      </dl>

      <div className="flex justify-end">
        <Button variant="outline" color="gray" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
