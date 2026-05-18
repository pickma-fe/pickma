import { createServerClient } from '@/lib/supabase/server';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';
import { mockCategories } from '@/mocks/categories';

import { getCategories } from './_lib/service';

export async function GET(): Promise<Response> {
  if (isApiMockEnabled()) return success(mockCategories);

  try {
    const supabase = await createServerClient();
    const data = await getCategories(supabase);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
