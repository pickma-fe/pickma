import type { SellerApplicationDocumentType } from '@/contracts/seller-application';

export const SELLER_APPLICATION_DOCUMENT_LABELS: Record<
  SellerApplicationDocumentType,
  string
> = {
  business_license: '사업자등록증',
  food_service_permit: '영업신고증',
  bank_account: '통장 사본',
};

export function formatAdminDateTime(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}
