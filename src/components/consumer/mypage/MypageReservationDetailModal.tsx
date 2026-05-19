import type { ReactNode } from 'react';

import { useOrder } from '@/hooks/orders/useOrder';
import { Modal } from '@/components/common';

import type { MypageReservation } from './mypageReservationMapper';

interface MypageReservationDetailModalProps {
  isOpen: boolean;
  reservation: MypageReservation;
  onClose: () => void;
}

export function MypageReservationDetailModal({
  isOpen,
  reservation,
  onClose,
}: MypageReservationDetailModalProps) {
  const {
    data: orderDetail,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useOrder(isOpen ? reservation.id : '');
  const orderItems = orderDetail?.items ?? [];
  const totalQuantity =
    orderItems.length > 0
      ? orderItems.reduce((sum, item) => sum + item.quantity, 0)
      : reservation.quantity;
  const reservationTitle =
    orderItems[0]?.productName ??
    reservation.productName ??
    reservation.storeName;

  const handleRetryOrderDetail = () => {
    void refetch();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="예약 상세보기" size="md">
      <div className="space-y-6">
        <div>
          <p className="text-primary-500 text-sm font-semibold">
            {reservation.storeName}
          </p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {reservationTitle}
          </h2>
        </div>

        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center text-sm font-medium text-gray-500"
          >
            예약 상세 정보를 불러오는 중입니다.
          </div>
        ) : null}

        {isError && !orderDetail ? (
          <div
            role="alert"
            className="rounded-md border border-dashed border-red-200 bg-red-50 px-4 py-5 text-center"
          >
            <p className="text-sm font-semibold text-red-500">
              예약 상세 정보를 불러오지 못했습니다.
            </p>
            <button
              type="button"
              disabled={isFetching}
              onClick={handleRetryOrderDetail}
              className="mt-3 rounded-sm border border-red-200 px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetching ? '다시 불러오는 중' : '다시 시도'}
            </button>
          </div>
        ) : null}

        {orderItems.length > 0 ? (
          <section>
            <h3 className="mb-3 text-sm font-bold text-gray-900">주문 상품</h3>
            <ul className="space-y-3">
              {orderItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        수량 {item.quantity}개
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {item.subtotal.toLocaleString()}원
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <dl className="grid gap-4 text-sm">
          <ReservationDetailRow label="주문번호">
            {reservation.orderNumber}
          </ReservationDetailRow>
          <ReservationDetailRow label="픽업 날짜">
            {reservation.pickupDate}
          </ReservationDetailRow>
          <ReservationDetailRow label="픽업 시간">
            {reservation.pickupTime}
          </ReservationDetailRow>
          <ReservationDetailRow label="수량">
            {totalQuantity ? `${totalQuantity}개` : '확인 중'}
          </ReservationDetailRow>
          <ReservationDetailRow label="결제 금액">
            {reservation.price.toLocaleString()}원
          </ReservationDetailRow>
        </dl>
      </div>
    </Modal>
  );
}

interface ReservationDetailRowProps {
  label: string;
  children: ReactNode;
}

function ReservationDetailRow({ label, children }: ReservationDetailRowProps) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <dt className="font-semibold text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{children}</dd>
    </div>
  );
}
