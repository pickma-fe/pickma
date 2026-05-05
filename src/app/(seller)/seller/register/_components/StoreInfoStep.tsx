'use client';

import { useState } from 'react';

import type { StoreInfoData } from '@/types/store';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';

interface StoreInfoStepProps {
  onSubmit: (data: StoreInfoData) => void;
  savedData?: StoreInfoData | null;
  isViewMode?: boolean;
}

const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.startsWith('02')) {
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5)
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  }
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

export function StoreInfoStep({
  onSubmit,
  savedData,
  isViewMode = false,
}: StoreInfoStepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [info, setInfo] = useState<StoreInfoData>(
    savedData ?? {
      storeName: '',
      category: '',
      phone: '',
      address: '',
      description: '',
    }
  );
  const [errors, setErrors] = useState<Partial<StoreInfoData>>({});

  const handleChange =
    (field: keyof StoreInfoData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let value = e.target.value;
      if (field === 'phone') value = formatPhoneNumber(value);
      setInfo((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const validate = () => {
    const newErrors: Partial<StoreInfoData> = {};
    if (!info.storeName.trim()) newErrors.storeName = '가게명을 입력해주세요.';
    if (!info.category.trim()) newErrors.category = '카테고리를 선택해주세요.';
    if (!info.phone.trim()) newErrors.phone = '전화번호를 입력해주세요.';
    if (!info.address.trim()) newErrors.address = '주소를 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(info);
      setIsEditing(false);
    }
  };

  const fields = [
    { key: 'storeName' as const, label: '가게명', required: true },
    { key: 'category' as const, label: '카테고리', required: true },
    { key: 'phone' as const, label: '가게 전화번호', required: true },
    { key: 'address' as const, label: '가게 주소', required: true },
  ];

  if (isViewMode && !isEditing) {
    return (
      <div className="flex flex-col gap-4">
        <dl className="flex flex-col gap-3">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <dt className="text-sm font-medium text-gray-500">
                {field.label}
              </dt>
              <dd className="text-sm text-gray-900">
                {info[field.key] || '-'}
              </dd>
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <dt className="text-sm font-medium text-gray-500">가게 소개</dt>
            <dd className="text-sm text-gray-900">{info.description || '-'}</dd>
          </div>
        </dl>
        <div className="flex justify-end">
          <Button
            variant="outline"
            color="gray"
            onClick={() => setIsEditing(true)}
          >
            수정하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <Input
            key={field.key}
            label={`${field.label}${field.required ? ' *' : ''}`}
            value={info[field.key]}
            onChange={handleChange(field.key)}
            placeholder={`${field.label}을 입력해주세요`}
            error={errors[field.key]}
          />
        ))}
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
      <div className="flex justify-end gap-2">
        {isEditing && (
          <Button
            variant="outline"
            color="gray"
            onClick={() => setIsEditing(false)}
          >
            취소
          </Button>
        )}
        <Button onClick={handleSubmit}>확인</Button>
      </div>
    </div>
  );
}
