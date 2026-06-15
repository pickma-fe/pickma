import { ConsumerPageClient } from '@/components/consumer/ConsumerPageClient';

import { getConsumerPageInitialData } from '../_lib/getConsumerPageInitialData';

export const dynamic = 'force-dynamic';

export default async function ConsumerPage() {
  const { initialCategories } = await getConsumerPageInitialData();

  return <ConsumerPageClient initialCategories={initialCategories} />;
}
