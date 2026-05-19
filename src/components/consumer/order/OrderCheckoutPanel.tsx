'use client';

import { Clock, CreditCard, MapPin } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import type { ProductDetailResponse } from '@/contracts/product';
import {
  formatPickupDateLabel,
  formatPickupTime,
  type PickupTimeOption,
} from '@/lib/formatPickupTime';
import { useCreateOrder } from '@/hooks/orders/useCreateOrder';
import { usePayment } from '@/hooks/payments/usePayment';
import { Button } from '@/components/common';

import { PickupTimeChangeModal } from './PickupTimeChangeModal';

interface OrderCheckoutPanelProps {
  product: ProductDetailResponse;
  quantity: number;
  finalPaymentPrice: number;
  initialPickupTime?: PickupTimeOption;
}

type OrderInfoBlockProps =
  | {
      icon: ReactNode;
      title: string;
      actionLabel: string;
      onAction: () => void;
      children: ReactNode;
    }
  | {
      icon: ReactNode;
      title: string;
      actionLabel?: undefined;
      onAction?: undefined;
      children: ReactNode;
    };

function getPickupPlace(product: ProductDetailResponse) {
  return product.store.addressDetail
    ? `${product.store.address} ${product.store.addressDetail}`
    : product.store.address;
}

function createDefaultPickupTimeOption(
  pickupStartTime: string,
  pickupEndTime: string
): PickupTimeOption {
  const startAt = formatPickupTime(pickupStartTime);
  const endAt = formatPickupTime(pickupEndTime);

  return {
    label: `${startAt}~${endAt}`,
    startAt,
    endAt,
  };
}

function createPickupAt(
  pickupBaseDateTime: string,
  pickupTime: PickupTimeOption
) {
  const [hour, minute] = pickupTime.startAt.split(':').map(Number);

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

  const baseDate = pickupBaseDateTime.includes('T')
    ? new Date(pickupBaseDateTime)
    : new Date();

  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  const pickupAt = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hour,
    minute,
    0,
    0
  );

  return pickupAt.toISOString();
}

export function OrderCheckoutPanel({
  product,
  quantity,
  finalPaymentPrice,
  initialPickupTime,
}: OrderCheckoutPanelProps) {
  const createOrderMutation = useCreateOrder();
  const {
    openPayment,
    isPending: isPaymentPending,
    error: paymentError,
  } = usePayment();
  const pickupPlace = getPickupPlace(product);
  const [referenceNow, setReferenceNow] = useState(() => new Date());
  const pickupDateLabel = formatPickupDateLabel(
    product.pickupStartTime,
    referenceNow
  );
  const [pickupTime, setPickupTime] = useState(
    () =>
      initialPickupTime ??
      createDefaultPickupTimeOption(
        product.pickupStartTime,
        product.pickupEndTime
      )
  );
  const [isPickupTimeModalOpen, setIsPickupTimeModalOpen] = useState(false);
  const handleOpenPickupTimeModal = () => {
    setReferenceNow(new Date());
    setIsPickupTimeModalOpen(true);
  };
  const handlePaymentButtonClick = async () => {
    const pickupAt = createPickupAt(product.pickupStartTime, pickupTime);

    if (pickupAt === null) {
      return;
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        productId: product.id,
        quantity,
        pickupAt,
      });

      await openPayment({
        orderNumber: order.orderNumber,
        orderName: order.orderName,
      });
    } catch {
      // 에러 상태는 useCreateOrder/usePayment에서 노출한다.
    }
  };
  const isSubmitting = createOrderMutation.isPending || isPaymentPending;
  const paymentErrorMessage =
    createOrderMutation.error?.message ?? paymentError?.message;

  return (
    <>
      <section className="rounded-lg border border-gray-200 bg-white p-8">
        <OrderInfoBlock
          icon={<MapPin className="size-6" aria-hidden="true" />}
          title="픽업 정보"
        >
          <p className="text-base font-medium text-gray-900">{pickupPlace}</p>
          <p className="mt-2 text-sm text-gray-600">
            매장 방문 후 주문 상품을 수령해 주세요.
          </p>
        </OrderInfoBlock>

        <OrderInfoBlock
          icon={<Clock className="size-5" aria-hidden="true" />}
          title="픽업 시간"
          actionLabel="변경"
          onAction={handleOpenPickupTimeModal}
        >
          <p className="font-medium text-gray-900">
            {pickupDateLabel ? `${pickupDateLabel} ${pickupTime.label}` : '-'}
          </p>
        </OrderInfoBlock>

        <OrderInfoBlock
          icon={<CreditCard className="size-5" aria-hidden="true" />}
          title="결제 수단"
        >
          <p className="font-medium text-gray-900">토스페이먼츠</p>
          <p className="mt-2 text-sm text-gray-500">
            결제 수단은 추후 연동 예정입니다.
          </p>
        </OrderInfoBlock>

        <div className="mt-8 border-t border-gray-200 pt-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">최종 결제 금액</h2>
            <strong className="text-primary-500 text-2xl font-bold">
              {finalPaymentPrice.toLocaleString()}원
            </strong>
          </div>

          <Button
            disabled={isSubmitting}
            className="w-full py-4 text-lg font-bold"
            onClick={handlePaymentButtonClick}
          >
            {isSubmitting
              ? '결제 준비 중'
              : `${finalPaymentPrice.toLocaleString()}원 결제하기`}
          </Button>

          {paymentErrorMessage ? (
            <p role="alert" className="mt-3 text-center text-sm text-red-500">
              결제를 시작하지 못했습니다. 다시 시도해 주세요.
            </p>
          ) : null}

          <p className="mt-5 text-center text-xs leading-5 text-gray-500">
            결제 버튼을 누르면 픽마의 이용약관과 개인정보 처리방침에 동의하게
            됩니다.
          </p>
        </div>
      </section>

      {isPickupTimeModalOpen ? (
        <PickupTimeChangeModal
          isOpen={isPickupTimeModalOpen}
          selectedPickupTime={pickupTime}
          pickupStartTime={product.pickupStartTime}
          pickupEndTime={product.pickupEndTime}
          referenceNow={referenceNow}
          onChangePickupTime={setPickupTime}
          onClose={() => setIsPickupTimeModalOpen(false)}
        />
      ) : null}
    </>
  );
}

function OrderInfoBlock({
  icon,
  title,
  actionLabel,
  onAction,
  children,
}: OrderInfoBlockProps) {
  return (
    <div className="border-b border-gray-200 py-7 first:pt-0">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="flex gap-3 text-sm">
        <span className="mt-0.5 text-gray-600">{icon}</span>
        <div>{children}</div>
      </div>
    </div>
  );
}
