'use client';

import { type FormEvent, useState } from 'react';

import type { User } from '@/types/user';
import { useUpdateMe } from '@/hooks/users/useUpdateMe';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';

interface ProfileEditFormProps {
  name: string;
  onErrorClear: () => void;
  onErrorSet: (message: string) => void;
  user: User;
}

export function ProfileEditForm({
  name,
  onErrorClear,
  onErrorSet,
  user,
}: ProfileEditFormProps) {
  const { mutate: updateMe, isPending } = useUpdateMe();
  const [phone, setPhone] = useState(user.phone ?? '');

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
    <form
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      onSubmit={handleSubmit}
    >
      <Input
        label="연락처"
        value={phone}
        onChange={(event) => {
          setPhone(event.target.value);
          onErrorClear();
        }}
        placeholder="010-1234-5678"
        disabled={isPending}
      />

      <div className="flex justify-end gap-2 lg:items-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    </form>
  );
}
