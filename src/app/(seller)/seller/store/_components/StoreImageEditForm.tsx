'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/common/Button/Button';

interface StoreImageEditFormProps {
  currentImage?: string;
  storeName: string;
  onSubmit: (imageUrl: string, file?: File) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function StoreImageEditForm({
  currentImage,
  storeName,
  onSubmit,
  onCancel,
  isPending = false,
}: StoreImageEditFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImage ?? null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isSubmittedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUrl = previewUrl;
    return () => {
      if (currentUrl?.startsWith('blob:') && !isSubmittedRef.current) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setError('파일 크기는 5MB 이하여야 합니다.');
        e.currentTarget.value = '';
        return;
      }
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
      setError(null);
    }
    e.currentTarget.value = '';
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (previewUrl) {
      isSubmittedRef.current = true;
      onSubmit(previewUrl, selectedFile ?? undefined);
    }
  };

  const handleCancel = () => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    onCancel();
  };

  const renderImage = () => {
    if (!previewUrl) {
      return (
        <div className="flex h-full items-center justify-center text-gray-400">
          이미지를 선택해주세요
        </div>
      );
    }

    return (
      <Image
        src={previewUrl}
        alt={storeName}
        fill
        sizes="(max-width: 768px) 100vw, 500px"
        className="object-cover"
        unoptimized={previewUrl.startsWith('blob:')}
      />
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
        <Button
          variant="outline"
          color="gray"
          onClick={handleSelectClick}
          disabled={isPending}
        >
          파일 선택
        </Button>
        <p className="text-center text-xs text-gray-400">
          권장 사이즈 800x600px / JPG, PNG 파일 / 5MB 이하
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          color="gray"
          onClick={handleCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={!previewUrl || isPending}>
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}
