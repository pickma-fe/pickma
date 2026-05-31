import {
  CONSUMER_PRODUCTS_PER_PAGE,
  CONSUMER_REGION_ITEMS,
  getProductSortQuery,
} from '@/lib/consumerPageConfig';
import { DEFAULT_SORT_OPTION_ID } from '@/lib/consumerProductFilters';
import { ConsumerPageClient } from '@/components/consumer/ConsumerPageClient';

import { getConsumerPageInitialData } from './_lib/getConsumerPageInitialData';

export const dynamic = 'force-dynamic';

export default async function ConsumerPage() {
  const productSortQuery = getProductSortQuery(DEFAULT_SORT_OPTION_ID);
  const { initialProducts, initialCategories } =
    await getConsumerPageInitialData({
      page: 1,
      pageSize: CONSUMER_PRODUCTS_PER_PAGE,
      region: CONSUMER_REGION_ITEMS[0].value,
      sort: productSortQuery.sort,
      order: productSortQuery.order,
      availableOnly: true,
    });

  return (
    <ConsumerPageClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
