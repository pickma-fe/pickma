'use client';

import type { FormEvent } from 'react';

import { useUpdateMe } from '@/hooks/users/useUpdateMe';
import { Button } from '@/components/common/Button/Button';

interface ProfileEditFormProps {
  name: string;
  phone: string;
  onErrorClear: () => void;
  onErrorSet: (message: string) => void;
}

export function ProfileEditForm({
  name,
  phone,
  onErrorClear,
  onErrorSet,
}: ProfileEditFormProps) {
  const { mutate: updateMe, isPending } = useUpdateMe();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = name.trim();
    const nextPhone = phone.trim();

    if (!nextName) {
      onErrorSet('닉네임을 입력해주세요.');
      return;
    }

    if (!nextPhone) {
      onErrorSet('연락처를 입력해주세요.');
      return;
    }

    updateMe(
      { name: nextName, phone: nextPhone },
      {
        onSuccess: () => {
          onErrorClear();
        },
        onError: () => {
          onErrorSet('프로필 저장에 실패했습니다. 다시 시도해주세요.');
        },
      }
    );
  };

  return (
    <form className="flex justify-end" onSubmit={handleSubmit}>
      <Button type="submit" disabled={isPending}>
        {isPending ? '저장 중...' : '저장하기'}
      </Button>
    </form>
  );
}
