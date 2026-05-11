'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/common/Button/Button';

interface StoreImageEditFormProps {
  currentImage?: string;
  storeName: string;
  onSubmit: (imageUrl: string) => void;
  onCancel: () => void;
}

export function StoreImageEditForm({
  currentImage,
  storeName,
  onSubmit,
  onCancel,
}: StoreImageEditFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImage ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setError('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (previewUrl) {
      onSubmit(previewUrl);
    }
  };

  const renderImage = () => {
    if (!previewUrl) {
      return (
        <div className="flex h-full items-center justify-center text-gray-400">
          이미지를 선택해주세요
        </div>
      );
    }

    if (previewUrl.startsWith('blob:')) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={storeName}
          className="h-full w-full object-cover"
        />
      );
    }

    return (
      <Image src={previewUrl} alt={storeName} fill className="object-cover" />
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
        {renderImage()}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col gap-2">
        <Button variant="outline" color="gray" onClick={handleSelectClick}>
          파일 선택
        </Button>
        <p className="text-center text-xs text-gray-400">
          권장 사이즈 800x600px / JPG, PNG 파일 / 5MB 이하
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" color="gray" onClick={onCancel}>
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={!previewUrl}>
          저장
        </Button>
      </div>
    </div>
  );
}
