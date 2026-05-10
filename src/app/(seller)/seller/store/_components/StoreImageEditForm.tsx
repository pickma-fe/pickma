'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';

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
    currentImage || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={storeName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            이미지를 선택해주세요
          </div>
        )}
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
