'use client';

import { useMe } from '@/hooks/users/useMe';

import { ProfileEditForm } from './ProfileEditForm';

export function ProfileEditPageContent() {
  const { data: user, isError, isLoading } = useMe();

  if (isLoading) {
    return (
      <p role="status" className="rounded-lg border border-gray-200 p-6">
        내 정보를 불러오는 중입니다.
      </p>
    );
  }

  if (isError || !user) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-red-100 p-6 text-red-600"
      >
        내 정보를 불러오지 못했습니다.
      </p>
    );
  }

  return (
    <section className="max-w-150">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">내 정보 수정</h1>
        <p className="mt-2 text-sm text-gray-500">
          예약 안내에 사용할 닉네임과 연락처를 관리합니다.
        </p>
      </div>

      <ProfileEditForm user={user} />
    </section>
  );
}
