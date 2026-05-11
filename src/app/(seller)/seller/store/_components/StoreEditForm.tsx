'use client';

import { useState } from 'react';

import type { MyStore } from '@/types/store';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';

interface StoreEditFormProps {
  storeInfo: MyStore;
  onSubmit: (data: StoreEditData) => void;
  onCancel: () => void;
}

export interface StoreEditData {
  name: string;
  phone: string;
  address: string;
  addressDetail: string;
  region: string;
  description: string;
  openTime: string;
  closeTime: string;
}

export function StoreEditForm({
  storeInfo,
  onSubmit,
  onCancel,
}: StoreEditFormProps) {
  const [formData, setFormData] = useState<StoreEditData>({
    name: storeInfo.name,
    phone: storeInfo.phone,
    address: storeInfo.address,
    addressDetail: storeInfo.addressDetail ?? '',
    region: storeInfo.region,
    description: storeInfo.description ?? '',
    openTime: storeInfo.openTime?.slice(0, 5) ?? '09:00',
    closeTime: storeInfo.closeTime?.slice(0, 5) ?? '22:00',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof StoreEditData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = () => {
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim()
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
        />

        <Input
          label="가게 주소"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="주소를 입력해주세요"
        />

        <Input
          label="상세 주소"
          value={formData.addressDetail}
          onChange={(e) => handleChange('addressDetail', e.target.value)}
          placeholder="상세 주소를 입력해주세요"
        />

        <Input
          label="지역"
          value={formData.region}
          onChange={(e) => handleChange('region', e.target.value)}
          placeholder="서울 마포구"
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
        <Button variant="outline" color="gray" onClick={onCancel}>
          취소
        </Button>
        <Button onClick={handleSubmit}>저장</Button>
      </div>
    </div>
  );
}
