import type { UserRole, UserStatus } from '@/types/user';
import { formatDate } from '@/lib/format';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  customer: '소비자',
  seller: '판매자',
  admin: '관리자',
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: '활성',
  suspended: '정지',
  deleted: '삭제',
};

export { formatDate as formatAdminUserDate };
