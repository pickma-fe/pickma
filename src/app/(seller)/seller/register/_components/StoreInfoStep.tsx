'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';

interface StoreInfoStepProps {
  onSubmit: () => void;
}

interface StoreInfo {
  storeName: string;
  category: string;
  phone: string;
  address: string;
  description: string;
}

export function StoreInfoStep({ onSubmit }: StoreInfoStepProps) {
  const [info, setInfo] = useState<StoreInfo>({
    storeName: '',
    category: '',
    phone: '',
    address: '',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<StoreInfo>>({});

  const handleChange =
    (field: keyof StoreInfo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInfo((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const validate = () => {
    const newErrors: Partial<StoreInfo> = {};

    if (!info.storeName.trim()) {
      newErrors.storeName = '가게명을 입력해주세요.';
    }

    if (!info.category.trim()) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (!info.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    }

    if (!info.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Input
          label="가게명 *"
          value={info.storeName}
          onChange={handleChange('storeName')}
          placeholder="가게명을 입력해주세요"
          error={errors.storeName}
        />

        <Input
          label="카테고리 *"
          value={info.category}
          onChange={handleChange('category')}
          placeholder="예: 카페, 베이커리, 음식점"
          error={errors.category}
        />

        <Input
          label="가게 전화번호 *"
          value={info.phone}
          onChange={handleChange('phone')}
          placeholder="02-1234-5678"
          error={errors.phone}
        />

        <Input
          label="가게 주소 *"
          value={info.address}
          onChange={handleChange('address')}
          placeholder="가게 주소를 입력해주세요"
          error={errors.address}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm text-gray-500">
            가게 소개
          </label>
          <textarea
            id="description"
            value={info.description}
            onChange={handleChange('description')}
            placeholder="가게를 소개해주세요"
            rows={3}
            className="focus:border-primary-500 w-full rounded-md border border-gray-200 px-4 py-2 text-sm outline-none placeholder:text-gray-300"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit}>확인</Button>
      </div>
    </div>
  );
}
