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

// 전화번호 자동 하이픈
const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/[^0-9]/g, '');

  // 02 (서울)
  if (numbers.startsWith('02')) {
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5)
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  }

  // 010, 031, 032 등 (3자리 지역번호 or 휴대폰)
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

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
      let value = e.target.value;

      if (field === 'phone') {
        value = formatPhoneNumber(value);
      }

      setInfo((prev) => ({ ...prev, [field]: value }));
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
    } else {
      const phoneNumbers = info.phone.replace(/-/g, '');
      if (phoneNumbers.length < 9 || phoneNumbers.length > 11) {
        newErrors.phone = '올바른 전화번호를 입력해주세요.';
      }
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
          placeholder="02-1234-5678 또는 010-1234-5678"
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
