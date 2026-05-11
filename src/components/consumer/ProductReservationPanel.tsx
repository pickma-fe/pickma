'use client';

import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/common';

interface ProductReservationPanelProps {
  price: number;
  availableStock: number;
  pickupStartTime: string;
  pickupEndTime: string;
}

function formatPickupDate(value: string) {
  if (!value.includes('T')) {
    return '오늘';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '오늘';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

function createPickupTimeSlots(startTime: string, endTime: string) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const slots: { label: string; value: string }[] = [];

  if (start === null || end === null || start >= end) {
    return slots;
  }

  for (let current = start; current + 30 <= end; current += 30) {
    const next = current + 30;
    slots.push({
      value: `${formatMinutesToTime(current)}-${formatMinutesToTime(next)}`,
      label: `${formatMinutesToTime(current)}~${formatMinutesToTime(next)}`,
    });
  }

  return slots;
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

function isPastTimeSlot(slotValue: string, pickupDateTime: string, now: Date) {
  const [startTime] = slotValue.split('-');
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

export function ProductReservationPanel({
  price,
  availableStock,
  pickupStartTime,
  pickupEndTime,
}: ProductReservationPanelProps) {
  const [now] = useState(() => new Date());
  const timeSlots = useMemo(
    () => createPickupTimeSlots(pickupStartTime, pickupEndTime),
    [pickupStartTime, pickupEndTime]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(
    timeSlots[0]?.value ?? ''
  );

  const firstAvailableTimeSlot = timeSlots.find(
    (slot) => !isPastTimeSlot(slot.value, pickupStartTime, now)
  );
  const selectedSlot = timeSlots.find(
    (slot) => slot.value === selectedTimeSlot
  );
  const activeTimeSlot =
    selectedSlot && !isPastTimeSlot(selectedSlot.value, pickupStartTime, now)
      ? selectedSlot.value
      : (firstAvailableTimeSlot?.value ?? '');

  const [quantity, setQuantity] = useState(() => (availableStock > 0 ? 1 : 0));

  const handleDecreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };
  const handleIncreaseQuantity = () => {
    setQuantity((current) => Math.min(availableStock, current + 1));
  };
  const isDecreaseDisabled = quantity <= 1;
  const isIncreaseDisabled = quantity >= availableStock;
  const isAddButtonDisabled =
    activeTimeSlot === '' || availableStock <= 0 || quantity <= 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        픽업 날짜 및 시간 선택
      </h2>
      <div className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
        <button
          type="button"
          aria-label="이전 날짜"
          disabled
          className="text-gray-300 disabled:cursor-not-allowed"
        >
          <ChevronLeft />
        </button>

        <span className="text-base font-semibold text-gray-900">
          {formatPickupDate(pickupStartTime)}
        </span>

        <button
          type="button"
          aria-label="다음 날짜"
          disabled
          className="text-gray-300 disabled:cursor-not-allowed"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="mt-3 mb-6 grid max-h-42 grid-cols-3 gap-2 overflow-y-auto pr-1">
        {timeSlots.map((slot) => {
          const isSelected = activeTimeSlot === slot.value;
          const isDisabled = isPastTimeSlot(slot.value, pickupStartTime, now);

          return (
            <Button
              key={slot.value}
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
              onClick={() => setSelectedTimeSlot(slot.value)}
            >
              {slot.label}
            </Button>
          );
        })}

        {timeSlots.length === 0 ? (
          <p className="col-span-3 rounded-md border border-gray-200 p-4 text-sm text-gray-500">
            선택 가능한 픽업 시간이 없습니다.
          </p>
        ) : null}
      </div>

      <div className="mb-6">
        <p className="mb-3 text-lg font-semibold text-gray-900">수량 선택</p>
        <div className="flex w-fit overflow-hidden rounded-md border border-gray-200">
          <button
            type="button"
            aria-label="수량 감소"
            disabled={isDecreaseDisabled}
            className="px-4 py-2 text-gray-600 disabled:text-gray-300"
            onClick={handleDecreaseQuantity}
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span className="flex size-9 items-center justify-center border-x border-gray-200 text-sm font-medium text-gray-900">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="수량 증가"
            disabled={isIncreaseDisabled}
            className="px-4 py-2 text-gray-600 disabled:text-gray-300"
            onClick={handleIncreaseQuantity}
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Button
        disabled={isAddButtonDisabled}
        className="w-full py-3 text-xl font-extrabold"
      >
        {availableStock <= 0
          ? '예약 불가'
          : `${(price * quantity).toLocaleString()}원 담기`}
      </Button>

      <div className="mt-7 flex gap-3 rounded-md bg-gray-50 p-4">
        <div className="bg-primary-100 text-primary-500 flex size-9 shrink-0 items-center justify-center rounded-full">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>

        <div>
          <p className="text-sm font-bold text-gray-900">픽마 안심 서비스</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            상품에 문제가 있을 경우 픽마가 100% 환불해드려요.
          </p>
        </div>
      </div>
    </div>
  );
}
