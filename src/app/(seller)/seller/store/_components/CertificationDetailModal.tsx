'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';

interface CertificationDetailModalProps {
  label: string;
  isCompleted: boolean;
  imageUrl?: string;
  onClose: () => void;
  onSubmit: (label: string, imageUrl: string) => void;
  canSubmitHere: boolean;
  expiresAt?: string;
}

export function CertificationDetailModal({
  label,
  isCompleted,
  imageUrl,
  onClose,
  onSubmit,
  canSubmitHere,
  expiresAt,
}: CertificationDetailModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
  // 만료된 경우에만 갱신 버튼 표시
  const needsRenewal = label === '위생교육 수료증' && isCompleted && isExpired;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsUploading(true);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (previewUrl) {
      onSubmit(label, previewUrl);
    }
  };

  const getDescription = () => {
    if (!isCompleted) {
      return `${label}을(를) 제출해주세요.`;
    }
    if (isExpired) {
      return `${label}이(가) 만료되었습니다. 갱신이 필요합니다.`;
    }
    return `${label}이(가) 정상적으로 인증되었습니다.`;
  };

  const getBadgeColor = () => {
    if (!isCompleted) return 'warning';
    if (isExpired) return 'danger';
    return 'success';
  };

  const getBadgeText = () => {
    if (!isCompleted) return '신청 필요';
    if (isExpired) return '갱신 필요';
    return '인증 완료';
  };

  const renderImage = () => {
    if (!previewUrl) {
      return (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          이미지가 없습니다
        </div>
      );
    }

    if (previewUrl.startsWith('blob:')) {
      return (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={label}
            className="h-full w-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
        <Image src={previewUrl} alt={label} fill className="object-contain" />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <Badge variant="soft" color={getBadgeColor()}>
          {getBadgeText()}
        </Badge>
      </div>

      <p className="text-sm text-gray-500">{getDescription()}</p>

      {renderImage()}

      {isCompleted && expiresAt && (
        <dl className="flex flex-col gap-2">
          <div className="flex">
            <dt className="w-24 text-sm text-gray-500">만료일</dt>
            <dd
              className={`text-sm ${isExpired ? 'font-medium text-red-500' : 'text-gray-900'}`}
            >
              {expiresAt}
            </dd>
          </div>
        </dl>
      )}

      {canSubmitHere && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      <div className="flex justify-end gap-2">
        {canSubmitHere && !isCompleted && !isUploading && (
          <Button onClick={handleSelectClick}>서류 제출</Button>
        )}
        {canSubmitHere && needsRenewal && !isUploading && (
          <Button variant="outline" color="gray" onClick={handleSelectClick}>
            갱신하기
          </Button>
        )}
        {isUploading && <Button onClick={handleSubmit}>제출 완료</Button>}
        <Button variant="outline" color="gray" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
