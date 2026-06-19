import type {
  ReviewStatus,
  CertificationStatus,
} from '@/types/seller-register';

export const REVIEW_STATUS_TEXT: Record<ReviewStatus, string> = {
  pending: '심사 대기',
  reviewing: '심사 중',
  completed: '심사 완료',
};

export const CERTIFICATION_STATUS_TEXT: Record<CertificationStatus, string> = {
  waiting: '대기',
  approved: '승인',
  rejected: '반려',
};

export const REVIEW_STATUS_COLOR: Record<ReviewStatus, string> = {
  pending: 'bg-gray-100 text-gray-600',
  reviewing: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
};

export const CERTIFICATION_STATUS_COLOR: Record<CertificationStatus, string> = {
  waiting: 'bg-gray-100 text-gray-600',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};
