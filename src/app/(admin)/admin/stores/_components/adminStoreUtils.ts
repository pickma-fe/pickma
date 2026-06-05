import type { OperationStatus, StoreStatus } from '@/types/store';

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  active: '활성',
  inactive: '비활성',
};

export const OPERATION_STATUS_LABELS: Record<OperationStatus, string> = {
  open: '운영 중',
  closed: '운영 중지',
};

export function formatAdminStoreDate(value: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
}
