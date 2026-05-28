'use client';

import { HelpCircle, LogOut, MessageCircle, User, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useSignOut } from '@/hooks/auth/useSignOut';
import { useMe } from '@/hooks/users/useMe';

import { ProfileEditForm } from './ProfileEditForm';

const AUTH_PROVIDER_LABELS = {
  google: { label: '구글 계정으로 로그인', badge: 'G' },
  kakao: { label: '카카오 계정으로 로그인', badge: 'K' },
  email: { label: '이메일 계정으로 로그인', badge: '@' },
};

export function ProfileEditPageContent() {
  const router = useRouter();
  const { data: user, isError, isLoading } = useMe();
  const { mutateAsync: signOut, isPending: isSignOutPending } = useSignOut();

  async function handleSignOut() {
    await signOut();
    router.push('/');
    router.refresh();
  }

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

  const authProvider = user.authProvider
    ? AUTH_PROVIDER_LABELS[user.authProvider]
    : undefined;

  return (
    <section className="max-w-320">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">내 정보</h1>
        <p className="mt-2 text-sm text-gray-500">
          회원 정보를 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">계정 정보</h2>
              <p className="mt-2 text-sm text-gray-500">
                로그인 계정 정보를 확인할 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              disabled={isSignOutPending}
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              <LogOut className="size-4" aria-hidden="true" />
              로그아웃
            </button>
          </div>

          <div className="mt-7 flex items-center gap-8">
            <div className="bg-primary-50 text-primary-600 flex size-32 shrink-0 items-center justify-center rounded-full">
              <User className="size-16" aria-hidden="true" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <p className="text-xl font-bold text-gray-900">{user.name}</p>
                <span className="text-primary-600 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold">
                  일반 회원
                </span>
              </div>
              <p className="mt-3 text-base text-gray-500">{user.email}</p>
              {authProvider ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-4 items-center justify-center rounded-full bg-yellow-300 text-[10px] font-bold text-gray-900"
                  >
                    {authProvider.badge}
                  </span>
                  {authProvider.label}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-7 border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">
              이메일과 로그인 정보는 인증 계정 설정에서 관리됩니다.
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-7">
          <h2 className="text-lg font-bold text-gray-900">프로필 정보</h2>
          <p className="mt-2 text-sm text-gray-500">
            예약 안내에 사용할 닉네임과 연락처를 수정합니다.
          </p>
          <div className="mt-6">
            <ProfileEditForm user={user} />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-7">
          <h2 className="text-lg font-bold text-gray-900">계정 관리</h2>
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <UserX className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">회원 탈퇴</p>
                <p className="mt-1 text-sm text-gray-500">
                  계정을 삭제하고 모든 정보를 삭제합니다.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md border border-red-500 px-6 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              회원 탈퇴
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                도움이 필요하신가요?
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                1:1 문의하기 또는 고객센터를 이용해주세요.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="border-primary-500 text-primary-600 hover:bg-primary-50 inline-flex min-w-36 items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-semibold transition"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                1:1 문의하기
              </button>
              <button
                type="button"
                className="border-primary-500 text-primary-600 hover:bg-primary-50 inline-flex min-w-36 items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-semibold transition"
              >
                <HelpCircle className="size-4" aria-hidden="true" />
                고객센터
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
