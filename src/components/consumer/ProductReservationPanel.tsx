'use client';

import { Minus, Plus, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import {
  createPickupTimeOptions,
  formatPickupDateLabel,
  isPastPickupTimeSlot,
  type PickupTimeOption,
} from '@/lib/formatPickupTime';
import { Button } from '@/components/common';

interface ProductReservationPanelProps {
  productId: string;
  price: number;
  availableStock: number;
  pickupStartTime: string;
  pickupEndTime: string;
}

function getAddDisabledReason(
  activeTimeSlot: PickupTimeOption | null,
  availableStock: number,
  quantity: number
): string | null {
  if (availableStock <= 0 || quantity <= 0) {
    return '재고가 없어 예약할 수 없습니다.';
  }

  if (activeTimeSlot === null) {
    return '픽업 시간을 선택해 주세요.';
  }

  return null;
}

export function ProductReservationPanel({
  productId,
  price,
  availableStock,
  pickupStartTime,
  pickupEndTime,
}: ProductReservationPanelProps) {
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date()); // SSR 이후 브라우저 전용 시각 초기화 — 마운트 1회만 실행
  }, []);

  const timeSlots = useMemo(
    () => createPickupTimeOptions(pickupStartTime, pickupEndTime),
    [pickupStartTime, pickupEndTime]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const selectedSlot = timeSlots.find(
    (slot) => slot.startAt === selectedTimeSlot
  );
  const activeTimeSlot =
    selectedSlot &&
    (now === null ||
      !isPastPickupTimeSlot(selectedSlot.startAt, pickupStartTime, now))
      ? selectedSlot
      : null;

  const [quantity, setQuantity] = useState(() => (availableStock > 0 ? 1 : 0));

  const handleDecreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };
  const handleIncreaseQuantity = () => {
    setQuantity((current) => Math.min(availableStock, current + 1));
  };
  const handleAddButtonClick = () => {
    if (
      activeTimeSlot === null ||
      availableStock <= 0 ||
      quantity <= 0 ||
      (now !== null &&
        isPastPickupTimeSlot(activeTimeSlot.startAt, pickupStartTime, now))
    ) {
      setSelectedTimeSlot('');
      return;
    }

    const searchParams = new URLSearchParams({
      quantity: String(quantity),
      pickupStart: activeTimeSlot.startAt,
      pickupEnd: activeTimeSlot.endAt,
    });

    router.push(`/order/${productId}?${searchParams.toString()}`);
  };
  const isDecreaseDisabled = quantity <= 1;
  const isIncreaseDisabled = quantity >= availableStock;
  const addDisabledReason = getAddDisabledReason(
    activeTimeSlot,
    availableStock,
    quantity
  );
  const isAddButtonDisabled = addDisabledReason !== null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-900">픽업 시간 선택</h2>
      <div className="flex items-center justify-center rounded-md border border-gray-200 px-4 py-3">
        <span className="text-base font-semibold text-gray-900">
          {formatPickupDateLabel(pickupStartTime, now ?? undefined) ?? '-'}
        </span>
      </div>

      <div className="mt-3 mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {timeSlots.map((slot) => {
          const isSelected = activeTimeSlot?.startAt === slot.startAt;
          const isDisabled =
            now !== null &&
            isPastPickupTimeSlot(slot.startAt, pickupStartTime, now);

          return (
            <Button
              key={slot.startAt}
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
              onClick={() => setSelectedTimeSlot(slot.startAt)}
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
            className="focus-visible:ring-primary-500 px-4 py-2 text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:text-gray-300"
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
            className="focus-visible:ring-primary-500 px-4 py-2 text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:text-gray-300"
            onClick={handleIncreaseQuantity}
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Button
        disabled={isAddButtonDisabled}
        aria-describedby={addDisabledReason ? 'add-disabled-reason' : undefined}
        className="w-full py-3 text-xl font-extrabold"
        onClick={handleAddButtonClick}
      >
        {availableStock <= 0
          ? '예약 불가'
          : `${(price * quantity).toLocaleString()}원 담기`}
      </Button>

      {addDisabledReason ? (
        <p
          id="add-disabled-reason"
          className="mt-3 text-center text-sm text-red-500"
        >
          {addDisabledReason}
        </p>
      ) : null}

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
