'use client';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Hash,
  Package,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type { Order, OrderStatus } from '@/types/order';
import { useAcceptSellerOrder } from '@/hooks/seller/orders/useAcceptSellerOrder';
import { useCancelSellerOrder } from '@/hooks/seller/orders/useCancelSellerOrder';
import { useCompleteSellerOrder } from '@/hooks/seller/orders/useCompleteSellerOrder';
import { useMarkSellerOrderReady } from '@/hooks/seller/orders/useMarkSellerOrderReady';
import { useNoShowSellerOrder } from '@/hooks/seller/orders/useNoShowSellerOrder';
import { useSellerOrder } from '@/hooks/seller/orders/useSellerOrder';
import { Badge } from '@/components/common/Badge/Badge';
import { Button } from '@/components/common/Button/Button';
import { Section } from '@/components/common/Section/Section';

import { OrderCancelModal } from './OrderCancelModal';
import { OrderCompleteConfirmModal } from './OrderCompleteConfirmModal';

interface OrderDetailContentProps {
  orderId: string;
}

type DisplayableOrderStatus = Extract<
  OrderStatus,
  | 'reserved'
  | 'accepted'
  | 'ready'
  | 'completed'
  | 'cancelling'
  | 'cancelled'
  | 'noShow'
>;

const STATUS_BADGE: Record<
  DisplayableOrderStatus,
  { label: string; color: 'warning' | 'info' | 'success' | 'danger' | 'gray' }
> = {
  reserved: { label: '수락 대기', color: 'warning' },
  accepted: { label: '주문 승인', color: 'info' },
  ready: { label: '픽업 대기', color: 'info' },
  completed: { label: '픽업 완료', color: 'success' },
  cancelling: { label: '취소 처리 중', color: 'warning' },
  cancelled: { label: '취소/환불', color: 'danger' },
  noShow: { label: '미수령', color: 'gray' },
};

const STATUS_DESCRIPTION: Record<DisplayableOrderStatus, string> = {
  reserved: '주문을 수락하거나 취소해주세요.',
  accepted: '주문 상품을 준비해주세요.',
  ready: '고객 픽업을 기다리고 있습니다.',
  completed: '픽업이 완료되었습니다.',
  cancelling: '결제 취소 처리 중입니다.',
  cancelled: '주문이 취소/환불되었습니다.',
  noShow: '고객이 미수령하였습니다.',
};

const formatPrice = (price: number) => price.toLocaleString('ko-KR') + '원';

const formatDateTime = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = String(hours % 12 || 12).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${period} ${displayHours}:${minutes}`;
};

function isDisplayableStatus(
  status: OrderStatus
): status is DisplayableOrderStatus {
  return status in STATUS_BADGE;
}

interface ActionButtonsProps {
  order: Order;
  isPending: boolean;
  onAccept: () => void;
  onReady: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onNoShow: () => void;
}

function ActionButtons({
  order,
  isPending,
  onAccept,
  onReady,
  onComplete,
  onCancel,
  onNoShow,
}: ActionButtonsProps) {
  switch (order.status) {
    case 'reserved':
      return (
        <div className="flex gap-3">
          <Button onClick={onAccept} disabled={isPending} className="flex-1">
            {isPending ? '처리 중...' : '주문 접수'}
          </Button>
          <Button
            variant="outline"
            color="danger"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1"
          >
            주문 취소
          </Button>
        </div>
      );
    case 'accepted':
      return (
        <div className="flex gap-3">
          <Button onClick={onReady} disabled={isPending} className="flex-1">
            {isPending ? '처리 중...' : '준비 완료'}
          </Button>
          <Button
            variant="outline"
            color="danger"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1"
          >
            주문 취소
          </Button>
        </div>
      );
    case 'ready':
      return (
        <div className="flex gap-3">
          <Button onClick={onComplete} disabled={isPending} className="flex-1">
            {isPending ? '처리 중...' : '픽업 완료'}
          </Button>
          <Button
            variant="outline"
            color="danger"
            onClick={onNoShow}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? '처리 중...' : '미수령 처리'}
          </Button>
        </div>
      );
    case 'cancelling':
      return (
        <p className="text-sm text-gray-500">
          결제 취소 처리 중으로 액션이 제한됩니다.
        </p>
      );
    default:
      return null;
  }
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2">
      <dt className="mt-0.5 flex min-w-[90px] items-center gap-1.5 text-xs text-gray-400">
        <span className="text-gray-400">{icon}</span>
        {label}
      </dt>
      <dd className="text-sm break-all text-gray-700">{value}</dd>
    </div>
  );
}

function BackButton() {
  return (
    <Link
      href="/seller/orders"
      className="flex w-fit items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
    >
      <ArrowLeft className="h-4 w-4" />
      주문 목록으로
    </Link>
  );
}

export function OrderDetailContent({ orderId }: OrderDetailContentProps) {
  const { data: order, isLoading, isError } = useSellerOrder(orderId);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelErrorMessage, setCancelErrorMessage] = useState<string | null>(
    null
  );
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const acceptOrder = useAcceptSellerOrder();
  const markOrderReady = useMarkSellerOrderReady();
  const completeOrder = useCompleteSellerOrder();
  const cancelOrder = useCancelSellerOrder();
  const noShowOrder = useNoShowSellerOrder();

  const isPending =
    acceptOrder.isPending ||
    markOrderReady.isPending ||
    completeOrder.isPending ||
    cancelOrder.isPending ||
    noShowOrder.isPending;

  const handleAction = (
    mutate: (
      id: string,
      callbacks: { onSuccess: () => void; onError: () => void }
    ) => void,
    successLabel: string,
    errorLabel: string
  ) => {
    setActionError(null);
    setActionSuccess(null);
    mutate(orderId, {
      onSuccess: () =>
        setActionSuccess(`${successLabel} 처리가 완료되었습니다.`),
      onError: () =>
        setActionError(`${errorLabel} 처리에 실패했습니다. 다시 시도해주세요.`),
    });
  };

  const handleCancelConfirm = (reason: string) => {
    cancelOrder.mutate(
      { id: orderId, reason },
      {
        onSuccess: () => {
          setCancelModalOpen(false);
          setCancelErrorMessage(null);
          setActionSuccess('주문 취소 처리가 완료되었습니다.');
        },
        onError: () => {
          setCancelErrorMessage(
            '주문 취소 처리에 실패했습니다. 다시 시도해주세요.'
          );
        },
      }
    );
  };

  const handleCompleteConfirm = () => {
    completeOrder.mutate(orderId, {
      onSuccess: () => {
        setCompleteModalOpen(false);
        setActionSuccess('픽업 완료 처리가 완료되었습니다.');
      },
      onError: () => {
        setCompleteModalOpen(false);
        setActionError('픽업 완료 처리에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">주문 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col gap-6">
        <BackButton />
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
          <AlertCircle className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            주문 정보를 불러오지 못했습니다.
          </p>
          <p className="text-xs text-gray-400">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  const badge = isDisplayableStatus(order.status)
    ? STATUS_BADGE[order.status]
    : null;
  const description = isDisplayableStatus(order.status)
    ? STATUS_DESCRIPTION[order.status]
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
            주문 상세
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            주문번호 {order.orderNumber}
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Section variant="card">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">
                  주문 상태
                </h2>
                {badge && (
                  <Badge variant="soft" color={badge.color}>
                    {badge.label}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
              <ActionButtons
                order={order}
                isPending={isPending}
                onAccept={() =>
                  handleAction(
                    (id, cb) => acceptOrder.mutate(id, cb),
                    '주문 접수',
                    '주문 접수'
                  )
                }
                onReady={() =>
                  handleAction(
                    (id, cb) => markOrderReady.mutate(id, cb),
                    '준비 완료',
                    '준비 완료'
                  )
                }
                onComplete={() => setCompleteModalOpen(true)}
                onCancel={() => {
                  setCancelErrorMessage(null);
                  setCancelModalOpen(true);
                }}
                onNoShow={() =>
                  handleAction(
                    (id, cb) => noShowOrder.mutate(id, cb),
                    '미수령',
                    '미수령'
                  )
                }
              />
            </div>
          </Section>

          <Section variant="card">
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">
                주문 상품
              </h2>
              {order.items.length === 0 ? (
                <p className="text-sm text-gray-400">상품 정보가 없습니다.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl">
                          🛍️
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatPrice(item.discountPrice)} × {item.quantity}
                            개
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold whitespace-nowrap text-gray-900">
                        {formatPrice(item.subtotal)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>상품 금액</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>할인 금액</span>
                  <span className="text-red-500">
                    -{formatPrice(order.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>결제 금액</span>
                  <span>{formatPrice(order.paymentAmount)}</span>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-6">
          <Section variant="card">
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">
                픽업 정보
              </h2>
              <dl className="flex flex-col gap-3">
                {order.pickupNumber && (
                  <InfoRow
                    icon={<Hash className="h-4 w-4" />}
                    label="픽업 번호"
                    value={
                      <span className="text-2xl font-bold text-gray-900">
                        {order.pickupNumber}
                      </span>
                    }
                  />
                )}
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="픽업 시간"
                  value={formatDateTime(order.pickupAt)}
                />
                {order.storeOrderNumber && (
                  <InfoRow
                    icon={<ShoppingBag className="h-4 w-4" />}
                    label="가게 주문번호"
                    value={order.storeOrderNumber}
                  />
                )}
                {order.pickedUpAt && (
                  <InfoRow
                    icon={<CheckCircle className="h-4 w-4" />}
                    label="픽업 완료 시간"
                    value={formatDateTime(order.pickedUpAt)}
                  />
                )}
              </dl>
            </div>
          </Section>

          <Section variant="card">
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">
                주문 정보
              </h2>
              <dl className="flex flex-col gap-3">
                <InfoRow
                  icon={<Package className="h-4 w-4" />}
                  label="주문번호"
                  value={order.orderNumber}
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="주문 일시"
                  value={formatDateTime(order.createdAt)}
                />
                {order.cancelledAt && (
                  <InfoRow
                    icon={<AlertCircle className="h-4 w-4" />}
                    label="취소 일시"
                    value={formatDateTime(order.cancelledAt)}
                  />
                )}
                {order.cancelReason && (
                  <InfoRow
                    icon={<AlertCircle className="h-4 w-4" />}
                    label="취소 사유"
                    value={order.cancelReason}
                  />
                )}
              </dl>
            </div>
          </Section>
        </div>
      </div>

      <OrderCancelModal
        isOpen={cancelModalOpen}
        isSubmitting={cancelOrder.isPending}
        errorMessage={cancelErrorMessage}
        onClose={() => {
          setCancelModalOpen(false);
          setCancelErrorMessage(null);
        }}
        onConfirm={handleCancelConfirm}
      />

      <OrderCompleteConfirmModal
        isOpen={completeModalOpen}
        isSubmitting={completeOrder.isPending}
        orderNumber={order.orderNumber}
        pickupNumber={order.pickupNumber ?? null}
        storeOrderNumber={order.storeOrderNumber ?? null}
        onClose={() => setCompleteModalOpen(false)}
        onConfirm={handleCompleteConfirm}
      />
    </div>
  );
}
