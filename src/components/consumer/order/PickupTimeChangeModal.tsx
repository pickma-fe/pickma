import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import {
  createPickupTimeOptions,
  formatPickupDateLabel,
  isPastPickupTimeSlot,
  type PickupTimeOption,
} from '@/lib/formatPickupTime';
import { Button, Modal } from '@/components/common';

interface PickupTimeChangeModalProps {
  isOpen: boolean;
  selectedPickupTime: PickupTimeOption;
  pickupStartTime: string;
  pickupEndTime: string;
  referenceNow: Date;
  onChangePickupTime: (pickupTime: PickupTimeOption) => void;
  onClose: () => void;
}

export function PickupTimeChangeModal({
  isOpen,
  selectedPickupTime,
  pickupStartTime,
  pickupEndTime,
  referenceNow,
  onChangePickupTime,
  onClose,
}: PickupTimeChangeModalProps) {
  const pickupTimeOptions = createPickupTimeOptions(
    pickupStartTime,
    pickupEndTime
  );
  const initialDraftPickupTime =
    pickupTimeOptions.find(
      (option) => option.startAt === selectedPickupTime.startAt
    ) &&
    !isPastPickupTimeSlot(
      selectedPickupTime.startAt,
      pickupStartTime,
      referenceNow
    )
      ? selectedPickupTime
      : null;
  const [draftPickupTime, setDraftPickupTime] = useState(
    initialDraftPickupTime
  );
  const pickupDateLabel = formatPickupDateLabel(pickupStartTime, referenceNow);
  const isDraftPickupTimePast =
    draftPickupTime !== null &&
    isPastPickupTimeSlot(
      draftPickupTime.startAt,
      pickupStartTime,
      referenceNow
    );
  const hasAvailablePickupTime = pickupTimeOptions.some(
    (option) =>
      !isPastPickupTimeSlot(option.startAt, pickupStartTime, referenceNow)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="픽업 시간 변경" size="md">
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            픽업 날짜
          </h3>

          <div className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
            <button
              type="button"
              aria-label="이전 날짜"
              disabled
              className="text-gray-300 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>

            <span className="text-base font-semibold text-gray-900">
              {pickupDateLabel}
            </span>

            <button
              type="button"
              aria-label="다음 날짜"
              disabled
              className="text-gray-300 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            시간 선택
          </h3>

          <div className="grid max-h-42 grid-cols-3 gap-2 overflow-y-auto pr-1">
            {pickupTimeOptions.map((option) => {
              const isSelected = option.startAt === draftPickupTime?.startAt;
              const isDisabled = isPastPickupTimeSlot(
                option.startAt,
                pickupStartTime,
                referenceNow
              );

              return (
                <Button
                  key={option.startAt}
                  type="button"
                  variant="outline"
                  color={isSelected ? 'primary' : 'gray'}
                  aria-pressed={isSelected}
                  disabled={isDisabled}
                  className={[
                    'h-auto rounded-md px-3 py-3 text-sm',
                    isSelected && !isDisabled ? 'bg-primary-50' : 'bg-white',
                    isDisabled ? 'text-gray-300' : '',
                  ].join(' ')}
                  onClick={() => setDraftPickupTime(option)}
                >
                  {option.label}
                </Button>
              );
            })}

            {!hasAvailablePickupTime ? (
              <p className="col-span-3 rounded-md border border-gray-200 p-4 text-sm text-gray-500">
                선택 가능한 픽업 시간이 없습니다.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            color="gray"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={draftPickupTime === null || isDraftPickupTimePast}
            onClick={() => {
              if (draftPickupTime) {
                onChangePickupTime(draftPickupTime);
              }
              onClose();
            }}
          >
            변경하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
