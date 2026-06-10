import 'server-only';

import type { Category } from '@/types/category';
import { categoryServerApi } from '@/api/categories/categoryServerApi';

interface ConsumerPageInitialData {
  initialCategories?: Category[];
}

export async function getConsumerPageInitialData(): Promise<ConsumerPageInitialData> {
  try {
    const initialCategories = await categoryServerApi.getCategories();
    return { initialCategories };
  } catch {
    return {};
  }
}
