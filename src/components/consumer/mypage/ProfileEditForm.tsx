'use client';

import { type FormEvent, useState } from 'react';

import type { User } from '@/types/user';
import { useUpdateMe } from '@/hooks/users/useUpdateMe';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';

interface ProfileEditFormProps {
  user: User;
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const { mutate: updateMe, isPending } = useUpdateMe();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = name.trim();
    const nextPhone = phone.trim();

    if (!nextName) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (!nextPhone) {
      setError('연락처를 입력해주세요.');
      return;
    }

    updateMe(
      { name: nextName, phone: nextPhone },
      {
        onError: () => {
          setError('프로필 저장에 실패했습니다. 다시 시도해주세요.');
        },
      }
    );
  };

  return (
    <form
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      onSubmit={handleSubmit}
    >
      {error ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-600 lg:col-span-3"
        >
          {error}
        </p>
      ) : null}

      <Input
        label="닉네임"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError(null);
        }}
        placeholder="닉네임을 입력해주세요"
        disabled={isPending}
      />

      <Input
        label="연락처"
        value={phone}
        onChange={(event) => {
          setPhone(event.target.value);
          setError(null);
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
