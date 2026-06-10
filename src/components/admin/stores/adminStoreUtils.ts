import type { OperationStatus, StoreStatus } from '@/types/store';
import { formatDate } from '@/lib/format';

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  active: '활성',
  inactive: '비활성',
};

export const OPERATION_STATUS_LABELS: Record<OperationStatus, string> = {
  open: '운영 중',
  closed: '운영 중지',
};

export { formatDate as formatAdminStoreDate };
