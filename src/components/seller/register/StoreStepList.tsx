'use client';

import type {
  StoreStep,
  ModalType,
  StoreStepState,
} from '@/types/seller-register';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button/Button';

import {
  REVIEW_STATUS_COLOR,
  REVIEW_STATUS_TEXT,
  CERTIFICATION_STATUS_COLOR,
  CERTIFICATION_STATUS_TEXT,
} from './constants';
import { StatusBadge } from './StatusBadge';
import {
  getStepCircleClass,
  getStepLabel,
  getButtonVariant,
  getButtonColor,
} from './utils';

interface StoreStepListProps {
  steps: StoreStep[];
  storeState: StoreStepState;
  isAuthCompleted: boolean;
  onActionClick: (modal: ModalType) => void;
}

function getStoreStepStatus(
  stepId: number,
  storeState: StoreStepState,
  isAuthCompleted: boolean
): 'done' | 'active' | 'pending' {
  if (!isAuthCompleted) return 'pending';

  switch (stepId) {
    case 1:
      return storeState.storeInfoSubmitted ? 'done' : 'active';
    case 2:
      if (!storeState.storeInfoSubmitted) return 'pending';
      return storeState.reviewStatus === 'completed' ? 'done' : 'active';
    case 3:
      if (storeState.reviewStatus !== 'completed') return 'pending';
      return storeState.storeStatus === 'approved' ? 'done' : 'active';
    default:
      return 'pending';
  }
}

export function StoreStepList({
  steps,
  storeState,
  isAuthCompleted,
  onActionClick,
}: StoreStepListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {steps.map((step) => {
        const status = getStoreStepStatus(step.id, storeState, isAuthCompleted);
        const actionText =
          step.id === 1 && storeState.storeInfoSubmitted ? '보기' : step.action;

        return (
          <li
            key={step.id}
            className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  getStepCircleClass(status)
                )}
              >
                {getStepLabel(status, step.id)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {step.title}
                </p>
                <p className="text-xs break-words text-gray-400">
                  {step.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {step.id === 2 && status !== 'pending' && (
                <StatusBadge
                  text={REVIEW_STATUS_TEXT[storeState.reviewStatus]}
                  colorClass={REVIEW_STATUS_COLOR[storeState.reviewStatus]}
                />
              )}

              {step.id === 3 && status !== 'pending' && (
                <StatusBadge
                  text={CERTIFICATION_STATUS_TEXT[storeState.storeStatus]}
                  colorClass={
                    CERTIFICATION_STATUS_COLOR[storeState.storeStatus]
                  }
                />
              )}

              {step.id === 1 && status !== 'pending' && (
                <Button
                  variant={getButtonVariant(status)}
                  color={getButtonColor(status)}
                  className="text-xs whitespace-nowrap"
                  onClick={() => onActionClick(step.modal)}
                >
                  {actionText}
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
