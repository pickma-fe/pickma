'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';

interface BusinessInfoStepProps {
  onNext: () => void;
}

interface BusinessInfo {
  businessNumber: string;
  companyName: string;
  representativeName: string;
  businessAddress: string;
  businessType: string;
  businessCategory: string;
}

export function BusinessInfoStep({ onNext }: BusinessInfoStepProps) {
  const [info, setInfo] = useState<BusinessInfo>({
    businessNumber: '',
    companyName: '',
    representativeName: '',
    businessAddress: '',
    businessType: '',
    businessCategory: '',
  });

  const [errors, setErrors] = useState<Partial<BusinessInfo>>({});

  const handleChange =
    (field: keyof BusinessInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setInfo((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const validate = () => {
    const newErrors: Partial<BusinessInfo> = {};

    if (!info.businessNumber.trim()) {
      newErrors.businessNumber = '사업자등록번호를 입력해주세요.';
    } else if (!/^\d{10}$/.test(info.businessNumber.replace(/-/g, ''))) {
      newErrors.businessNumber = '올바른 사업자등록번호를 입력해주세요.';
    }

    if (!info.companyName.trim()) {
      newErrors.companyName = '상호명을 입력해주세요.';
    }

    if (!info.representativeName.trim()) {
      newErrors.representativeName = '대표자명을 입력해주세요.';
    }

    if (!info.businessAddress.trim()) {
      newErrors.businessAddress = '사업장 주소를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext();
    }
  };

  const fields = [
    {
      key: 'businessNumber' as const,
      label: '사업자등록번호',
      placeholder: '000-00-00000',
      required: true,
    },
    {
      key: 'companyName' as const,
      label: '상호명',
      placeholder: '상호명을 입력해주세요',
      required: true,
    },
    {
      key: 'representativeName' as const,
      label: '대표자명',
      placeholder: '대표자명을 입력해주세요',
      required: true,
    },
    {
      key: 'businessAddress' as const,
      label: '사업장 주소',
      placeholder: '사업장 주소를 입력해주세요',
      required: true,
    },
    {
      key: 'businessType' as const,
      label: '업태',
      placeholder: '업태를 입력해주세요',
      required: false,
    },
    {
      key: 'businessCategory' as const,
      label: '종목',
      placeholder: '종목을 입력해주세요',
      required: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <Input
            key={field.key}
            label={`${field.label}${field.required ? ' *' : ''}`}
            value={info[field.key]}
            onChange={handleChange(field.key)}
            placeholder={field.placeholder}
            error={errors[field.key]}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit}>확인</Button>
      </div>
    </div>
  );
}
