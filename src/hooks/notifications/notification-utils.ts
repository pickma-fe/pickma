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
  if (pathname === '/mypage/orders' || pathname.startsWith('/mypage/orders/'))
    return null;
  return STATUS_MESSAGES[`${oldStatus}->${newStatus}`] ?? null;
}

export const MAX_DEDUPE_SIZE = 200;

export function addBounded(set: Set<string>, key: string) {
  if (set.size >= MAX_DEDUPE_SIZE) {
    const oldest = set.values().next().value;
    if (oldest !== undefined) set.delete(oldest);
  }
  set.add(key);
}

export function isNewSellerOrder(
  oldStatus: string | null | undefined,
  newStatus: string | null | undefined
): boolean {
  return newStatus === 'reserved' && oldStatus !== 'reserved';
}
