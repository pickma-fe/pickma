'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button/Button';

interface TermsStepProps {
  onNext: () => void;
}

const TERMS = [
  {
    id: 'service',
    title: '서비스 이용약관 (필수)',
    content: `제1조 (목적) 이 약관은 픽마(이하 "회사")가 제공하는 판매자 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의) 본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
1. "서비스"란 회사가 제공하는 마감 할인 상품 판매 플랫폼을 의미합니다.
2. "판매자"란 회사와 계약을 체결하고 서비스를 통해 상품을 판매하는 사업자를 의미합니다.

제3조 (약관의 효력) 이 약관은 서비스를 이용하고자 하는 모든 판매자에게 적용됩니다.`,
    required: true,
  },
  {
    id: 'privacy',
    title: '개인정보 수집 및 이용 동의 (필수)',
    content: `1. 수집 항목: 사업자등록번호, 대표자명, 사업장 주소, 연락처
2. 수집 목적: 판매자 본인 확인 및 서비스 제공
3. 보유 기간: 서비스 이용 계약 종료 후 5년`,
    required: true,
  },
  {
    id: 'marketing',
    title: '마케팅 정보 수신 동의 (선택)',
    content: `회사는 판매자에게 서비스 관련 마케팅 정보를 이메일, SMS 등으로 발송할 수 있습니다. 본 동의는 선택사항으로 동의하지 않아도 서비스 이용이 가능합니다.`,
    required: false,
  },
];

export function TermsStep({ onNext }: TermsStepProps) {
  const [agreed, setAgreed] = useState<Record<string, boolean>>({
    service: false,
    privacy: false,
    marketing: false,
  });

  const allRequired = TERMS.filter((t) => t.required).every(
    (t) => agreed[t.id]
  );

  const handleAllAgree = () => {
    const allChecked = Object.values(agreed).every(Boolean);
    setAgreed({
      service: !allChecked,
      privacy: !allChecked,
      marketing: !allChecked,
    });
  };

  const handleAgree = (id: string) => {
    setAgreed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-md border border-gray-200 p-4">
        <input
          type="checkbox"
          id="all"
          checked={Object.values(agreed).every(Boolean)}
          onChange={handleAllAgree}
          className="text-primary-500 focus:ring-primary-500 h-4 w-4 rounded border-gray-300 focus:ring-offset-0"
        />
        <label htmlFor="all" className="text-sm font-semibold text-gray-900">
          전체 동의
        </label>
      </div>

      <div className="flex flex-col gap-4">
        {TERMS.map((term) => (
          <div key={term.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={term.id}
                checked={agreed[term.id]}
                onChange={() => handleAgree(term.id)}
                className="text-primary-500 focus:ring-primary-500 h-4 w-4 rounded border-gray-300 focus:ring-offset-0"
              />
              <label htmlFor={term.id} className="text-sm text-gray-700">
                {term.title}
              </label>
            </div>
            <div className="h-32 overflow-y-auto rounded-md border border-gray-200 p-3 text-xs whitespace-pre-line text-gray-500">
              {term.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!allRequired}>
          확인
        </Button>
      </div>
    </div>
  );
}
