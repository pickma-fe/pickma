import { CONSUMER_PRODUCTS_PER_PAGE } from '@/lib/consumerPageConfig';
import { ConsumerPageClient } from '@/components/consumer/ConsumerPageClient';

import { getConsumerPageInitialData } from './_lib/getConsumerPageInitialData';

export const dynamic = 'force-dynamic';

export default async function ConsumerPage() {
  const { initialCategories } = await getConsumerPageInitialData({
    page: 1,
    pageSize: CONSUMER_PRODUCTS_PER_PAGE,
    availableOnly: true,
  });

  return <ConsumerPageClient initialCategories={initialCategories} />;
}
