'use client';

import Image from 'next/image';

import type { SellerApplicationDocument } from '@/types/seller-application';
import { useDocumentSignedUrl } from '@/hooks/seller/applications/useDocumentSignedUrl';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';

import { DOC_TYPE_LABEL } from './certificationConstants';

interface CertificationDetailModalProps {
  document: SellerApplicationDocument;
  onClose: () => void;
}

function isImageContentType(contentType: string): boolean {
  return contentType.startsWith('image/');
}

export function CertificationDetailModal({
  document,
  onClose,
}: CertificationDetailModalProps) {
  const label = DOC_TYPE_LABEL[document.type] ?? document.type;
  const isImage = isImageContentType(document.contentType);

  const {
    data: signedUrl,
    isLoading,
    isError,
  } = useDocumentSignedUrl({
    documentId: document.id,
  });

  const renderDocument = () => {
    if (isLoading) {
      return (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-gray-100">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        </div>
      );
    }

    if (isError || !signedUrl) {
      return (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-red-500">
          문서를 불러올 수 없습니다
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={signedUrl}
            alt={label}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-contain"
            unoptimized
          />
        </div>
      );
    }

    // PDF 등 이미지가 아닌 문서
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-lg bg-gray-100">
        <span className="text-4xl">📄</span>
        <p className="text-sm text-gray-500">
          이 문서는 미리보기를 지원하지 않습니다.
        </p>
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          새 탭에서 열기
        </a>
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

      {renderDocument()}

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
            {document.createdAt.toLocaleDateString('ko-KR')}
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
