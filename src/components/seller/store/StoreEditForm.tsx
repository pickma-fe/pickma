'use client';

import { useState } from 'react';

import type { MyStore } from '@/types/store';
import { openPostcodeSearch } from '@/lib/kakao/postcode';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';

interface StoreEditFormProps {
  storeInfo: MyStore;
  onSubmit: (data: StoreEditData) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export interface StoreEditData {
  name: string;
  phone: string;
  address: string;
  addressDetail: string;
  region: string;
  latitude?: number;
  longitude?: number;
  description: string;
  openTime: string;
  closeTime: string;
}

export function StoreEditForm({
  storeInfo,
  onSubmit,
  onCancel,
  isPending = false,
}: StoreEditFormProps) {
  const [formData, setFormData] = useState<StoreEditData>({
    name: storeInfo.name,
    phone: storeInfo.phone,
    address: storeInfo.address,
    addressDetail: storeInfo.addressDetail ?? '',
    region: storeInfo.region,
    latitude: storeInfo.latitude,
    longitude: storeInfo.longitude,
    description: storeInfo.description ?? '',
    openTime: storeInfo.openTime?.slice(0, 5) ?? '09:00',
    closeTime: storeInfo.closeTime?.slice(0, 5) ?? '22:00',
  });
  const [error, setError] = useState<string | null>(null);

  const handleAddressSearch = async () => {
    await openPostcodeSearch(
      (info) => {
        setFormData((prev) => ({
          ...prev,
          address: info.address,
          region: info.region,
          latitude: info.latitude,
          longitude: info.longitude,
        }));
        setError(null);
      },
      () => setError('주소 검색 중 오류가 발생했습니다. 다시 시도해 주세요.')
    );
  };

  const handleChange = (field: keyof StoreEditData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = () => {
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.region.trim()
    ) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.openTime >= formData.closeTime) {
      setError('마감 시간은 오픈 시간보다 늦어야 합니다.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Input
          label="가게 이름"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="가게 이름을 입력해주세요"
        />

        <Input
          label="사업자등록번호"
          value={storeInfo.businessNumber}
          disabled
        />

        <Input
          label="가게 전화번호"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="02-1234-5678"
          autoComplete="tel"
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                label="가게 주소"
                value={formData.address}
                readOnly
                placeholder="주소 검색 버튼을 눌러주세요"
                autoComplete="street-address"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              color="gray"
              className="mt-6"
              onClick={() => void handleAddressSearch()}
            >
              주소 검색
            </Button>
          </div>
        </div>

        <Input
          label="상세 주소"
          value={formData.addressDetail}
          onChange={(e) => handleChange('addressDetail', e.target.value)}
          placeholder="상세 주소를 입력해주세요"
        />

        <Input
          label="가게 소개"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="가게 소개를 입력해주세요"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="오픈 시간"
            type="time"
            value={formData.openTime}
            onChange={(e) => handleChange('openTime', e.target.value)}
          />
          <Input
            label="마감 시간"
            type="time"
            value={formData.closeTime}
            onChange={(e) => handleChange('closeTime', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          color="gray"
          onClick={onCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}
