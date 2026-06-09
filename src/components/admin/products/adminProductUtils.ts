import type { ProductDisplayStatus, ProductStatus } from '@/types/product';

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

export function formatAdminProductDate(value: Date | undefined): string {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value);
}

export function formatAdminProductPrice(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}
