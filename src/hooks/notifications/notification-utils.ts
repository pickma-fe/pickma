import type { ToastType } from '@/stores/useToastStore';

const STATUS_MESSAGES: Record<
  string,
  { message: string; type: ToastType } | undefined
> = {
  'reserved->accepted': { message: '주문이 접수되었습니다', type: 'success' },
  'accepted->ready': { message: '준비가 완료되었습니다', type: 'success' },
  'ready->completed': { message: '픽업이 완료되었습니다', type: 'info' },
};

export function resolveConsumerOrderToast(
  oldStatus: string | null | undefined,
  newStatus: string | null | undefined,
  pathname: string
): { message: string; type: ToastType } | null {
  if (!oldStatus || !newStatus) return null;
  if (pathname.startsWith('/mypage/orders')) return null;
  return STATUS_MESSAGES[`${oldStatus}->${newStatus}`] ?? null;
}

export function isNewSellerOrder(
  oldStatus: string | null | undefined,
  newStatus: string | null | undefined
): boolean {
  return newStatus === 'reserved' && oldStatus !== 'reserved';
}
