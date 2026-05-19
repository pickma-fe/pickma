import type { SupabaseClient } from '@supabase/supabase-js';

import type { CategoryListResponse } from '@/contracts/category';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import type { Database } from '@/lib/supabase/database';

import { mapCategoryRow, type CategoryRow } from './mapper';

export async function getCategories(
  supabase: SupabaseClient<Database>
): Promise<CategoryListResponse> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, icon, sort_order')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);

  return ((data ?? []) as unknown as CategoryRow[]).map(mapCategoryRow);
}
