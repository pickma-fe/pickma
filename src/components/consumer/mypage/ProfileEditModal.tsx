'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import type { User } from '@/types/user';
import { useUpdateMe } from '@/hooks/users/useUpdateMe';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { Modal } from '@/components/common/Modal/Modal';

interface ProfileEditModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
}

const FALLBACK_PROFILE_IMAGE = '/images/mock/profile.jpg';

export function ProfileEditModal({
  isOpen,
  user,
  onClose,
}: ProfileEditModalProps) {
  const { mutate: updateMe, isPending } = useUpdateMe();
  const [name, setName] = useState(user.name);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.profileImage ?? null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      e.currentTarget.value = '';
      return;
    }
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedFile(file);
    setError(null);
    e.currentTarget.value = '';
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    updateMe(
      { name: name.trim(), imageFile: selectedFile ?? undefined },
      {
        onSuccess: () => {
          if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
          }
          onClose();
        },
        onError: () => {
          setError('수정에 실패했습니다. 다시 시도해주세요.');
        },
      }
    );
  };

  const displayImage = previewUrl ?? FALLBACK_PROFILE_IMAGE;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="프로필 수정" size="sm">
      <div className="flex flex-col gap-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <div className="relative size-20 overflow-hidden rounded-full bg-gray-100">
            {previewUrl?.startsWith('blob:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="프로필 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={displayImage}
                alt="프로필 이미지"
                fill
                sizes="80px"
                className="object-cover"
              />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            color="gray"
            onClick={() => fileInputRef.current?.click()}
          >
            이미지 변경
          </Button>
          <p className="text-xs text-gray-400">JPG, PNG / 5MB 이하</p>
        </div>

        <Input
          label="닉네임"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="닉네임을 입력해주세요"
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" color="gray" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
