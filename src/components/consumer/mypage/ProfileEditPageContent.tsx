'use client';

import {
  HelpCircle,
  LogOut,
  MessageCircle,
  Pencil,
  User,
  UserX,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useSignOut } from '@/hooks/auth/useSignOut';
import { useDeleteMe } from '@/hooks/users/useDeleteMe';
import { useMe } from '@/hooks/users/useMe';
import { Button } from '@/components/common/Button/Button';
import { Modal } from '@/components/common/Modal/Modal';

import { ProfileEditForm } from './ProfileEditForm';

const AUTH_PROVIDER_LABELS = {
  google: '구글',
  kakao: '카카오',
  email: '이메일',
};

const ROLE_LABELS = {
  customer: '일반 회원',
  seller: '판매자',
  admin: '관리자',
};

export function ProfileEditPageContent() {
  const router = useRouter();
  const { data: user, isError, isLoading } = useMe();
  const { mutateAsync: deleteMe, isPending: isDeletePending } = useDeleteMe();
  const { mutateAsync: signOut, isPending: isSignOutPending } = useSignOut();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSignOut() {
    await signOut();
    router.push('/');
    router.refresh();
  }

  async function handleDeleteAccount() {
    setDeleteError(null);

    try {
      await deleteMe();
      await signOut();
      router.push('/');
      router.refresh();
    } catch {
      setDeleteError('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
    }
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

  const authProviderLabel = user.authProvider
    ? AUTH_PROVIDER_LABELS[user.authProvider]
    : undefined;
  const editName = name || user.name;
  const userName = user.name;

  function handleEditToggle() {
    setIsEditOpen((current) => {
      if (!current) {
        setName(userName);
        setEditError(null);
      }

      return !current;
    });
  }

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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEditToggle}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Pencil className="size-4" aria-hidden="true" />
                {isEditOpen ? '수정 닫기' : '정보 수정'}
              </button>
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
          </div>

          <div className="mt-7 flex items-center gap-8">
            <div className="bg-primary-50 text-primary-600 flex size-32 shrink-0 items-center justify-center rounded-full">
              <User className="size-16" aria-hidden="true" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                {isEditOpen ? (
                  <label className="flex min-w-64 flex-col gap-1">
                    <span className="text-sm text-gray-500">닉네임</span>
                    <textarea
                      value={editName}
                      onChange={(event) => {
                        setName(event.target.value);
                        setEditError(null);
                      }}
                      rows={3}
                      className="focus:border-primary-500 focus:ring-primary-300 w-full resize-none rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 outline-none focus:ring-2"
                    />
                  </label>
                ) : (
                  <p className="text-xl font-bold text-gray-900">{user.name}</p>
                )}
                <span className="text-primary-600 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <p className="mt-3 text-base text-gray-500">{user.email}</p>
              <p className="mt-2 text-base text-gray-500">
                {user.phone ?? '등록된 연락처가 없습니다.'}
              </p>
              {authProviderLabel ? (
                <p className="mt-3 text-sm text-gray-600">
                  로그인 방식: {authProviderLabel}
                </p>
              ) : null}
            </div>
          </div>

          {isEditOpen ? (
            <div className="mt-7 border-t border-gray-100 pt-6">
              {editError ? (
                <p
                  role="alert"
                  className="mb-5 rounded-md bg-red-50 p-3 text-sm text-red-600"
                >
                  {editError}
                </p>
              ) : null}

              <ProfileEditForm
                name={editName}
                onErrorClear={() => setEditError(null)}
                onErrorSet={setEditError}
                user={user}
              />
            </div>
          ) : null}
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
                  계정을 비활성화하고 PickMa 이용을 중단합니다.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="회원 탈퇴"
        size="sm"
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-900">
              정말 회원 탈퇴를 진행할까요?
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              탈퇴하면 계정이 비활성화되고 PickMa 서비스를 이용할 수 없습니다.
            </p>
          </div>

          {deleteError ? (
            <p
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-red-600"
            >
              {deleteError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              color="gray"
              disabled={isDeletePending || isSignOutPending}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              취소
            </Button>
            <Button
              color="danger"
              disabled={isDeletePending || isSignOutPending}
              onClick={() => void handleDeleteAccount()}
            >
              {isDeletePending || isSignOutPending ? '탈퇴 중...' : '탈퇴하기'}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
