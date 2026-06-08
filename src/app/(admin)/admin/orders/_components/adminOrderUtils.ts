import type { OrderStatus } from '@/types/order';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  paymentPending: '결제 대기',
  processing: '결제 처리 중',
  reserved: '예약 완료',
  accepted: '접수 완료',
  ready: '픽업 준비',
  completed: '픽업 완료',
  cancelling: '취소 처리 중',
  cancelled: '취소',
  noShow: '노쇼',
  expired: '만료',
};

export const ORDER_STATUS_QUERY_VALUES = [
  'payment_pending',
  'processing',
  'reserved',
  'accepted',
  'ready',
  'completed',
  'cancelled',
  'no_show',
  'expired',
] as const;

export const ORDER_STATUS_QUERY_LABELS: Record<
  (typeof ORDER_STATUS_QUERY_VALUES)[number],
  string
> = {
  payment_pending: '결제 대기',
  processing: '결제 처리 중',
  reserved: '예약 완료',
  accepted: '접수 완료',
  ready: '픽업 준비',
  completed: '픽업 완료',
  cancelled: '취소',
  no_show: '노쇼',
  expired: '만료',
};

export function formatAdminOrderDate(value: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value);
}

export function formatAdminOrderAmount(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}
