'use client';

import { useState } from 'react';

import type { BusinessInfoData } from '@/types/store';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';

interface BusinessInfoStepProps {
  onNext: (data: BusinessInfoData) => void;
  savedData?: BusinessInfoData | null;
  isViewMode?: boolean;
}

const formatBusinessNumber = (value: string) => {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
};

const DEFAULT_INFO: BusinessInfoData = {
  businessNumber: '',
  companyName: '',
  representativeName: '',
  businessAddress: '',
  businessType: '',
  businessCategory: '',
};

export function BusinessInfoStep({
  onNext,
  savedData,
  isViewMode = false,
}: BusinessInfoStepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [info, setInfo] = useState<BusinessInfoData>(savedData ?? DEFAULT_INFO);
  const [errors, setErrors] = useState<Partial<BusinessInfoData>>({});

  const handleChange =
    (field: keyof BusinessInfoData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (field === 'businessNumber') {
        value = formatBusinessNumber(value);
      }
      setInfo((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const handleCancel = () => {
    setInfo(savedData ?? DEFAULT_INFO);
    setErrors({});
    setIsEditing(false);
  };

  const validate = () => {
    const newErrors: Partial<BusinessInfoData> = {};
    if (!info.businessNumber.trim()) {
      newErrors.businessNumber = '사업자등록번호를 입력해주세요.';
    } else if (!/^\d{10}$/.test(info.businessNumber.replace(/-/g, ''))) {
      newErrors.businessNumber = '올바른 사업자등록번호를 입력해주세요.';
    }
    if (!info.companyName.trim())
      newErrors.companyName = '상호명을 입력해주세요.';
    if (!info.representativeName.trim())
      newErrors.representativeName = '대표자명을 입력해주세요.';
    if (!info.businessAddress.trim())
      newErrors.businessAddress = '사업장 주소를 입력해주세요.';
    if (!info.businessType.trim())
      newErrors.businessType = '업태를 입력해주세요.';
    if (!info.businessCategory.trim())
      newErrors.businessCategory = '종목을 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext(info);
      setIsEditing(false);
    }
  };

  const fields = [
    { key: 'businessNumber' as const, label: '사업자등록번호', required: true },
    { key: 'companyName' as const, label: '상호명', required: true },
    { key: 'representativeName' as const, label: '대표자명', required: true },
    { key: 'businessAddress' as const, label: '사업장 주소', required: true },
    { key: 'businessType' as const, label: '업태', required: true },
    { key: 'businessCategory' as const, label: '종목', required: true },
  ];

  if (isViewMode && !isEditing) {
    return (
      <div className="flex flex-col gap-4">
        {/* TODO(T29): onboarding-status API 확장 후 savedData로 실제 신청 데이터 표시
          현재는 페이지 이동 후 데이터 유실로 '-' 표시됨 */}
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
      </div>
      <div className="flex justify-end gap-2">
        {isEditing && (
          <Button variant="outline" color="gray" onClick={handleCancel}>
            취소
          </Button>
        )}
        <Button onClick={handleSubmit}>확인</Button>
      </div>
    </div>
  );
}
