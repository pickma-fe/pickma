export interface RecentProduct {
  id: string;
  name: string;
  imageUrl?: string;
  viewedAt: string;
}

export type RecentProductInput = Pick<
  RecentProduct,
  'id' | 'name' | 'imageUrl'
>;

export const RECENT_PRODUCTS_STORAGE_KEY = 'pickma:recent-products';
export const RECENT_PRODUCTS_EVENT = 'pickma:recent-products-change';

const MAX_RECENT_PRODUCTS = 10;
const EMPTY_RECENT_PRODUCTS = '[]';

export function parseRecentProducts(value: string): RecentProduct[] {
  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isRecentProduct);
  } catch {
    return [];
  }
}

export function getRecentProductsRawSnapshot() {
  if (typeof window === 'undefined') {
    return EMPTY_RECENT_PRODUCTS;
  }

  return (
    window.localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY) ??
    EMPTY_RECENT_PRODUCTS
  );
}

export function getRecentProductsServerSnapshot() {
  return EMPTY_RECENT_PRODUCTS;
}

export function subscribeRecentProducts(listener: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === RECENT_PRODUCTS_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener(RECENT_PRODUCTS_EVENT, listener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(RECENT_PRODUCTS_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function addRecentProduct(product: RecentProductInput) {
  if (typeof window === 'undefined') {
    return;
  }

  const recentProducts = parseRecentProducts(getRecentProductsRawSnapshot());
  const nextProduct: RecentProduct = {
    ...product,
    viewedAt: new Date().toISOString(),
  };
  const nextProducts = [
    nextProduct,
    ...recentProducts.filter(
      (recentProduct) => recentProduct.id !== product.id
    ),
  ].slice(0, MAX_RECENT_PRODUCTS);

  window.localStorage.setItem(
    RECENT_PRODUCTS_STORAGE_KEY,
    JSON.stringify(nextProducts)
  );
  window.dispatchEvent(new Event(RECENT_PRODUCTS_EVENT));
}

function isRecentProduct(value: unknown): value is RecentProduct {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const product = value as Partial<RecentProduct>;
  return (
    typeof product.id === 'string' &&
    typeof product.name === 'string' &&
    typeof product.viewedAt === 'string' &&
    (typeof product.imageUrl === 'string' ||
      typeof product.imageUrl === 'undefined')
  );
}
