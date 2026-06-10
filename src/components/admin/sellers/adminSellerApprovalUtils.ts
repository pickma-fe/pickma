import type { SellerApplicationDocumentType } from '@/contracts/seller-application';
import { formatDateTime } from '@/lib/format';

export const SELLER_APPLICATION_DOCUMENT_LABELS: Record<
  SellerApplicationDocumentType,
  string
> = {
  business_license: '사업자등록증',
  food_service_permit: '영업신고증',
  bank_account: '통장 사본',
};

export { formatDateTime as formatAdminDateTime };
