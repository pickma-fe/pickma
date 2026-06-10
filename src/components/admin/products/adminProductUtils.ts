import type { ProductDisplayStatus, ProductStatus } from '@/types/product';
import { formatDateTimeOrEmpty, formatNumber } from '@/lib/format';

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: '판매 중',
  closed: '판매 종료',
};

export const PRODUCT_DISPLAY_STATUS_LABELS: Record<
  ProductDisplayStatus,
  string
> = {
  available: '픽업 가능',
  soldOut: '품절',
  expired: '마감',
  closed: '판매 종료',
};

export {
  formatDateTimeOrEmpty as formatAdminProductDate,
  formatNumber as formatAdminProductPrice,
};
