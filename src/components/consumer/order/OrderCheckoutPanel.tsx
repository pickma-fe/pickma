'use client';

import { Clock, CreditCard, MapPin } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import type { ProductDetailResponse } from '@/contracts/product';
import {
  formatPickupDateLabel,
  formatPickupTime,
  type PickupTimeOption,
} from '@/lib/formatPickupTime';
import { Button } from '@/components/common';

import { PickupTimeChangeModal } from './PickupTimeChangeModal';

interface OrderCheckoutPanelProps {
  product: ProductDetailResponse;
  finalPaymentPrice: number;
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

export function OrderCheckoutPanel({
  product,
  finalPaymentPrice,
}: OrderCheckoutPanelProps) {
  const pickupPlace = getPickupPlace(product);
  const [referenceNow, setReferenceNow] = useState(() => new Date());
  const pickupDateLabel = formatPickupDateLabel(
    product.pickupStartTime,
    referenceNow
  );
  const [pickupTime, setPickupTime] = useState(() =>
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

          {/* TODO: 주문 생성 API 호출 후 토스페이먼츠 결제 위젯을 연결합니다. */}
          <Button className="w-full py-4 text-lg font-bold">
            {finalPaymentPrice.toLocaleString()}원 결제하기
          </Button>

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
