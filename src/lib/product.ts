type ProductAvailabilityParams = {
  product: {
    isSoldOut: boolean;
    isExpired: boolean;
    availableStock: number;
    endAt: string | Date;
  };
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
    (product.endAt instanceof Date
      ? product.endAt.getTime()
      : new Date(product.endAt).getTime()) <= now
  );
}

export function isProductAvailable(params: ProductAvailabilityParams) {
  return !isProductUnavailable(params);
}
