import { mockProducts } from './products';

export const mockRecentlyViewedProducts = mockProducts
  .slice(0, 4)
  .map((product) => ({
    id: product.id,
    name: product.name,
    imageUrl: product.image ?? '/images/products/bread.jpg',
  }));
