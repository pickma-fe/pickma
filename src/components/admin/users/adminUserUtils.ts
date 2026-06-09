import type { UserRole, UserStatus } from '@/types/user';

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

export function formatAdminUserDate(value: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
}
