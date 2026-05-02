'use client';

import { FileIcon, UploadIcon, X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button/Button';

interface DocumentStepProps {
  onSubmit: () => void;
}

const DOCUMENTS = [
  {
    id: 'businessLicense',
    title: '사업자 등록증',
    description: 'PNG, JPG, JPEG, PDF (최대 10MB)',
    required: true,
  },
  {
    id: 'idCard',
    title: '대표자 신분증',
    description: 'PNG, JPG, JPEG, PDF (최대 10MB)',
    required: true,
  },
  {
    id: 'bankbook',
    title: '통장 사본',
    description: 'PNG, JPG, JPEG, PDF (최대 10MB)',
    required: true,
  },
  {
    id: 'businessReport',
    title: '영업 신고증',
    description: 'PNG, JPG, JPEG, PDF (최대 10MB)',
    required: true,
  },
];

const ACCEPTED_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getDropzoneClass(isDragging: boolean, hasError: boolean): string {
  if (isDragging) {
    return 'border-primary-500 bg-primary-50';
  }
  if (hasError) {
    return 'border-red-300 bg-red-50';
  }
  return 'border-gray-300 bg-gray-50 hover:border-gray-400';
}

export function DocumentStep({ onSubmit }: DocumentStepProps) {
  const [files, setFiles] = useState<Record<string, File | null>>({
    businessLicense: null,
    idCard: null,
    bankbook: null,
    businessReport: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState<Record<string, boolean>>({});

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'PNG, JPG, JPEG, PDF 파일만 업로드 가능합니다.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return '파일 크기는 10MB 이하여야 합니다.';
    }
    return null;
  };

  const handleFileChange = (id: string, file: File | null) => {
    if (file) {
      const error = validateFile(file);
      if (error) {
        setErrors((prev) => ({ ...prev, [id]: error }));
        setFiles((prev) => ({ ...prev, [id]: null }));
        return;
      }
    }
    setFiles((prev) => ({ ...prev, [id]: file }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleInputChange =
    (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      handleFileChange(id, file);
    };

  const handleDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging((prev) => ({ ...prev, [id]: false }));
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileChange(id, file);
  };

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging((prev) => ({ ...prev, [id]: true }));
  };

  const handleDragLeave = (id: string) => () => {
    setIsDragging((prev) => ({ ...prev, [id]: false }));
  };

  const handleRemoveFile = (id: string) => () => {
    setFiles((prev) => ({ ...prev, [id]: null }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    DOCUMENTS.filter((d) => d.required).forEach((doc) => {
      if (!files[doc.id]) {
        newErrors[doc.id] = '필수 서류입니다. 파일을 첨부해주세요.';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  const isAllUploaded = DOCUMENTS.filter((d) => d.required).every(
    (doc) => files[doc.id]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {DOCUMENTS.map((doc) => {
          const uploadedFile = files[doc.id];
          const hasError = Boolean(errors[doc.id]);
          const dragging = Boolean(isDragging[doc.id]);

          return (
            <div key={doc.id} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {doc.title}
                {doc.required && <span className="ml-1 text-red-500">*</span>}
              </label>

              {uploadedFile ? (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile(doc.id)}
                    aria-label={`${doc.title} 파일 삭제`}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop(doc.id)}
                  onDragOver={handleDragOver(doc.id)}
                  onDragLeave={handleDragLeave(doc.id)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors',
                    getDropzoneClass(dragging, hasError)
                  )}
                >
                  <UploadIcon
                    className={cn(
                      'mb-2 h-8 w-8',
                      dragging ? 'text-primary-500' : 'text-gray-400'
                    )}
                  />
                  <p className="mb-1 text-sm text-gray-600">
                    파일을 드래그하거나{' '}
                    <label
                      htmlFor={doc.id}
                      className="text-primary-500 hover:text-primary-600 cursor-pointer font-medium"
                    >
                      직접 선택
                    </label>
                    하세요
                  </p>
                  <p className="text-xs text-gray-400">{doc.description}</p>
                  <input
                    type="file"
                    id={doc.id}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={handleInputChange(doc.id)}
                  />
                </div>
              )}

              {errors[doc.id] && (
                <p className="text-xs text-red-500">{errors[doc.id]}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-xs font-medium text-gray-700">📌 서류 제출 안내</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-gray-500">
          <li>모든 서류는 선명하게 촬영하거나 스캔해주세요.</li>
          <li>개인정보(주민번호 뒷자리 등)는 가려서 제출해주세요.</li>
          <li>서류 심사는 영업일 기준 1~2일 소요됩니다.</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!isAllUploaded}>
          서류 제출하기
        </Button>
      </div>
    </div>
  );
}
