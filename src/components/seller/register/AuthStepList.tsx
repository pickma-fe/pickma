'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { AuthStepState, ModalType } from '@/types/seller-register';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button/Button';

import {
  CERTIFICATION_STATUS_COLOR,
  CERTIFICATION_STATUS_TEXT,
  REVIEW_STATUS_COLOR,
  REVIEW_STATUS_TEXT,
} from './constants';
import { StatusBadge } from './StatusBadge';
import {
  getButtonColor,
  getButtonVariant,
  getStepCircleClass,
  isStepDone,
  getStepStatus,
} from './utils';

interface AuthStepListProps {
  state: AuthStepState;
  onActionClick: (modal: ModalType) => void;
}

export function AuthStepList({ state, onActionClick }: AuthStepListProps) {
  const router = useRouter();

  const steps = [
    {
      id: 1,
      title: '약관 동의',
      description: '판매자 이용약관에 동의합니다.',
      modal: 'terms' as ModalType,
      actionText: state.termsAgreed ? '보기' : '동의하기',
    },
    {
      id: 2,
      title: '사업자 정보 입력',
      description: '사업자 정보를 입력해주세요.',
      modal: 'business' as ModalType,
      actionText: state.businessInfoSubmitted ? '보기' : '입력하기',
    },
    {
      id: 3,
      title: '서류 제출',
      description: '필요 서류를 제출해주세요.',
      modal: 'document' as ModalType,
      actionText: state.documentsSubmitted ? '보기' : '제출하기',
    },
    {
      id: 4,
      title: '심사 진행',
      description: '제출하신 서류를 검토 중입니다.',
      modal: null,
      actionText: null,
    },
    {
      id: 5,
      title: '인증 완료',
      description:
        state.certificationStatus === 'rejected' && state.rejectionReason
          ? `반려 사유: ${state.rejectionReason}`
          : '인증 완료 후 가게 등록이 가능합니다.',
      modal: null,
      actionText: null,
    },
  ];

  return (
    <ul className="flex flex-col gap-3">
      {steps.map((step) => {
        const status = getStepStatus(step.id, state);

        return (
          <li
            key={step.id}
            className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  getStepCircleClass(status)
                )}
              >
                {isStepDone(status) ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  step.id
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {step.title}
                </p>
                <p
                  className={cn(
                    'text-xs wrap-break-word',
                    step.id === 5 && state.certificationStatus === 'rejected'
                      ? 'text-red-500'
                      : 'text-gray-400'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {step.id === 4 && status !== 'pending' && (
                <>
                  <StatusBadge
                    text={REVIEW_STATUS_TEXT[state.reviewStatus]}
                    colorClass={REVIEW_STATUS_COLOR[state.reviewStatus]}
                  />
                  {state.certificationStatus !== 'approved' && (
                    <Button
                      variant="outline"
                      color="gray"
                      className="text-xs whitespace-nowrap"
                      onClick={() => router.push('/seller/pending')}
                    >
                      상세 확인
                    </Button>
                  )}
                </>
              )}

              {step.id === 5 && status !== 'pending' && (
                <StatusBadge
                  text={CERTIFICATION_STATUS_TEXT[state.certificationStatus]}
                  colorClass={
                    CERTIFICATION_STATUS_COLOR[state.certificationStatus]
                  }
                />
              )}

              {step.id <= 3 && status !== 'pending' && (
                <Button
                  variant={getButtonVariant(status)}
                  color={getButtonColor(status)}
                  className="text-xs whitespace-nowrap"
                  onClick={() => onActionClick(step.modal)}
                >
                  {step.actionText}
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
