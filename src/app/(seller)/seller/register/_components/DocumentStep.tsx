'use client';

import { FileIcon, UploadIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button/Button';

interface DocumentStepProps {
  onSubmit: (
    files: Record<string, File | null>,
    documentConsentAgreed: true
  ) => void;
  savedFiles?: Record<string, File | null> | null;
  isViewMode?: boolean;
  isPending?: boolean;
  errorMessage?: string;
}

const DOCUMENTS = [
  {
    id: 'businessLicense',
    title: '사업자 등록증',
    description: 'PNG, JPG, JPEG, PDF (최대 10MB)',
    required: true,
  },
  {
    id: 'foodServicePermit',
    title: '영업신고증',
    description: 'PNG, JPG, JPEG, PDF (최대 10MB)',
    required: true,
  },
  {
    id: 'bankAccount',
    title: '통장 사본',
    description: 'PNG, JPG, JPEG, PDF (최대 10MB)',
    required: true,
  },
];

const INITIAL_FILES: Record<string, File | null> = {
  businessLicense: null,
  foodServicePermit: null,
  bankAccount: null,
};

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getDropzoneClass(isDragging: boolean, hasError: boolean): string {
  if (isDragging) return 'border-primary-500 bg-primary-50';
  if (hasError) return 'border-red-300 bg-red-50';
  return 'border-gray-300 bg-gray-50 hover:border-gray-400';
}

export function DocumentStep({
  onSubmit,
  savedFiles,
  isViewMode = false,
  isPending = false,
  errorMessage,
}: DocumentStepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<Record<string, File | null>>(
    () => savedFiles ?? INITIAL_FILES
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState<Record<string, boolean>>({});
  const [documentConsentAgreed, setDocumentConsentAgreed] = useState(false);

  const [originalFiles, setOriginalFiles] = useState<Record<
    string,
    File | null
  > | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type))
      return 'PNG, JPG, JPEG, PDF 파일만 업로드 가능합니다.';
    if (file.size > MAX_FILE_SIZE) return '파일 크기는 10MB 이하여야 합니다.';
    return null;
  };

  const handleFileChange = (id: string, file: File | null) => {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, [id]: error }));
      setFiles((prev) => ({ ...prev, [id]: null }));
      return;
    }
    setFiles((prev) => ({ ...prev, [id]: file }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleInputChange =
    (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      handleFileChange(id, file);
      e.target.value = '';
    };

  const handleDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging((prev) => ({ ...prev, [id]: false }));
    handleFileChange(id, e.dataTransfer.files?.[0] ?? null);
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
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    DOCUMENTS.filter((d) => d.required).forEach((doc) => {
      if (!files[doc.id])
        newErrors[doc.id] = '필수 서류입니다. 파일을 첨부해주세요.';
    });
    if (!documentConsentAgreed) {
      newErrors.documentConsent =
        '판매자 심사용 서류 수집·이용에 동의해주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(files, true);
      setIsEditing(false);
      setOriginalFiles(null);
    }
  };

  const handleStartEdit = () => {
    setOriginalFiles({ ...files });
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (originalFiles) {
      setFiles(originalFiles);
    }
    setErrors({});
    setDocumentConsentAgreed(false);
    setOriginalFiles(null);
    setIsEditing(false);
  };

  const isAllUploaded = DOCUMENTS.filter((d) => d.required).every(
    (doc) => files[doc.id]
  );

  if (isViewMode && !isEditing) {
    return (
      <div className="flex flex-col gap-4">
        {/* TODO(T29): onboarding-status API 확장 후 제출된 서류 파일명/URL 표시 필요
          현재는 페이지 이동 후 File 객체 유실로 '파일 없음' 표시됨 */}
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">
            ✓ 모든 서류가 제출되었습니다.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {DOCUMENTS.map((doc) => {
            const uploadedFile = files[doc.id];
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doc.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {uploadedFile ? uploadedFile.name : '파일 없음'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-green-600">제출 완료</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" color="gray" onClick={handleStartEdit}>
            수정하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {DOCUMENTS.map((doc) => {
          const uploadedFile = files[doc.id];
          const hasError = Boolean(errors[doc.id]);
          const dragging = Boolean(isDragging[doc.id]);

          return (
            <div key={doc.id} className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                {doc.title}
                {doc.required && <span className="ml-1 text-red-500">*</span>}
              </span>

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
                <label
                  htmlFor={doc.id}
                  onDrop={handleDrop(doc.id)}
                  onDragOver={handleDragOver(doc.id)}
                  onDragLeave={handleDragLeave(doc.id)}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors',
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
                    파일을 드래그하거나 클릭하여 선택하세요
                  </p>
                  <p className="text-xs text-gray-400">{doc.description}</p>
                  <input
                    type="file"
                    id={doc.id}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={handleInputChange(doc.id)}
                  />
                </label>
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

      <div className="rounded-lg border border-gray-200 p-4">
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={documentConsentAgreed}
            onChange={(event) => setDocumentConsentAgreed(event.target.checked)}
            className="text-primary-500 focus:ring-primary-500 mt-0.5 h-4 w-4 rounded border-gray-300 focus:ring-offset-0"
          />
          <span>
            사업자등록증, 영업신고증, 통장사본을 판매자 심사와 서비스 제공을
            위해 수집·이용하는 데 동의합니다.
            <span className="ml-1 text-red-500">(필수)</span>
          </span>
        </label>
        <p className="mt-2 pl-7 text-xs text-gray-500">
          신분증 원본, 민감정보, 고유식별정보는 수집하지 않습니다. 자세한 보유
          기간과 철회 안내는{' '}
          <Link
            href="/privacy-policy"
            target="_blank"
            className="text-primary-600 underline underline-offset-2"
          >
            개인정보처리방침
          </Link>
          을 확인해주세요.
        </p>
        {errors.documentConsent && (
          <p className="mt-2 pl-7 text-xs text-red-500">
            {errors.documentConsent}
          </p>
        )}
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-500">
          {errorMessage}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {isEditing && (
          <Button variant="outline" color="gray" onClick={handleCancel}>
            취소
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!isAllUploaded || !documentConsentAgreed || isPending}
        >
          {isPending ? '제출 중...' : '서류 제출하기'}
        </Button>
      </div>
    </div>
  );
}
