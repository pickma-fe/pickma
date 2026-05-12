import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button, Modal } from '@/components/common';

interface PickupTimeChangeModalProps {
  isOpen: boolean;
  selectedPickupTime: string;
  pickupStartTime: string;
  pickupEndTime: string;
  onChangePickupTime: (pickupTime: string) => void;
  onClose: () => void;
}

function parseTimeToMinutes(value: string) {
  const time = value.includes('T') ? value.split('T')[1] : value;
  const [hour, minute] = time.split(':').map(Number);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}

function formatMinutesToTime(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function createPickupTimeOptions(startTime: string, endTime: string) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const options: string[] = [];

  if (start === null || end === null || start >= end) {
    return options;
  }

  for (let current = start; current + 30 <= end; current += 30) {
    const next = current + 30;
    options.push(
      `${formatMinutesToTime(current)}~${formatMinutesToTime(next)}`
    );
  }

  return options;
}

function formatPickupDate(value: string) {
  if (!value.includes('T')) {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }).format(new Date());
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }).format(new Date());
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

function isPastTimeSlot(slotValue: string, pickupDateTime: string, now: Date) {
  const [startTime] = slotValue.split('~');
  const slotStartMinutes = parseTimeToMinutes(startTime);

  if (slotStartMinutes === null) {
    return true;
  }

  if (pickupDateTime.includes('T')) {
    const pickupDate = new Date(pickupDateTime);

    if (Number.isNaN(pickupDate.getTime())) {
      return true;
    }

    const pickupDateOnly = new Date(
      pickupDate.getFullYear(),
      pickupDate.getMonth(),
      pickupDate.getDate()
    );
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (pickupDateOnly.getTime() > today.getTime()) {
      return false;
    }

    if (pickupDateOnly.getTime() < today.getTime()) {
      return true;
    }
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return slotStartMinutes <= nowMinutes;
}

export function PickupTimeChangeModal({
  isOpen,
  selectedPickupTime,
  pickupStartTime,
  pickupEndTime,
  onChangePickupTime,
  onClose,
}: PickupTimeChangeModalProps) {
  const pickupTimeOptions = createPickupTimeOptions(
    pickupStartTime,
    pickupEndTime
  );
  const initialDraftPickupTime = pickupTimeOptions.includes(selectedPickupTime)
    ? selectedPickupTime
    : '';
  const [draftPickupTime, setDraftPickupTime] = useState(
    initialDraftPickupTime
  );
  const pickupDate = formatPickupDate(pickupStartTime);
  const now = new Date();

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
              오늘 {pickupDate}
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
            {pickupTimeOptions.map((time) => {
              const isSelected = time === draftPickupTime;
              const isDisabled = isPastTimeSlot(time, pickupStartTime, now);

              return (
                <Button
                  key={time}
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
                  onClick={() => setDraftPickupTime(time)}
                >
                  {time}
                </Button>
              );
            })}

            {pickupTimeOptions.length === 0 ? (
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
            disabled={draftPickupTime === ''}
            onClick={() => {
              onChangePickupTime(draftPickupTime);
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
