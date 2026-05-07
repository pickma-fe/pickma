import type { ProductListItemResponse } from '@/contracts/product';

type ProductAvailabilityParams = {
  product: ProductListItemResponse;
  now: number;
};

export function isProductUnavailable({
  product,
  now,
}: ProductAvailabilityParams) {
  return (
    product.isSoldOut ||
    product.isExpired ||
    product.availableStock <= 0 ||
    new Date(product.endAt).getTime() <= now
  );
}

export function isProductAvailable(params: ProductAvailabilityParams) {
  return !isProductUnavailable(params);
}
