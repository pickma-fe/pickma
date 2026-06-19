'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useMySellerApplication } from '@/hooks/seller/applications/useMySellerApplication';
import { useCreateStore } from '@/hooks/stores/useCreateStore';
import { useMyStore } from '@/hooks/stores/useMyStore';
import { useUpdateStore } from '@/hooks/stores/useUpdateStore';
import { Section } from '@/components/common/Section/Section';

import type { StoreEditData } from './StoreEditForm';
import { StoreEditForm } from './StoreEditForm';

export function StoreEditContent() {
  const router = useRouter();
  const {
    data: storeInfo,
    isLoading: isStoreLoading,
    isError: isStoreError,
  } = useMyStore();
  const {
    data: application,
    isLoading: isAppLoading,
    isError: isAppError,
  } = useMySellerApplication();
  const { mutate: createStore, isPending: isCreating } = useCreateStore();
  const { mutate: updateStore, isPending: isUpdating } = useUpdateStore();

  const isLoading = isStoreLoading || isAppLoading;
  const isPending = isCreating || isUpdating;

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (data: StoreEditData) => {
    if (storeInfo !== null && storeInfo !== undefined) {
      updateStore(
        {
          name: data.name,
          phone: data.phone,
          address: data.address,
          addressDetail: data.addressDetail || undefined,
          region: data.region,
          latitude: data.latitude,
          longitude: data.longitude,
          description: data.description || undefined,
          openTime: `${data.openTime}:00`,
          closeTime: `${data.closeTime}:00`,
        },
        { onSuccess: () => router.push('/seller/store') }
      );
    } else {
      const businessNumber = application?.businessNumber?.trim();
      if (!businessNumber) {
        setFormError(
          '사업자등록번호 정보를 불러오지 못했습니다. 페이지를 새로고침 후 다시 시도해 주세요.'
        );
        return;
      }
      setFormError(null);
      createStore(
        {
          name: data.name,
          phone: data.phone,
          address: data.address,
          addressDetail: data.addressDetail || undefined,
          region: data.region,
          latitude: data.latitude,
          longitude: data.longitude,
          description: data.description || undefined,
          businessNumber,
          openTime: data.openTime ? `${data.openTime}:00` : undefined,
          closeTime: data.closeTime ? `${data.closeTime}:00` : undefined,
        },
        { onSuccess: () => router.push('/seller/store') }
      );
    }
  };

  if (isStoreError || isAppError) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-red-500">
          가게/사업자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  const isEditMode = storeInfo !== null && storeInfo !== undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
          {isEditMode ? '가게 정보 수정' : '가게 등록'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? '가게 정보를 수정합니다.'
            : '가게 기본 정보를 입력해주세요.'}
        </p>
      </div>
      {formError && <p className="text-sm text-red-500">{formError}</p>}
      <Section variant="card">
        <StoreEditForm
          storeInfo={storeInfo ?? undefined}
          businessNumber={application?.businessNumber}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isPending={isPending}
        />
      </Section>
    </div>
  );
}
