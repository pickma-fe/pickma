import { createServerClient } from '@/lib/supabase/server';
import { routeError, success } from '@/app/api/_lib/response';

import { getCategories } from './_lib/service';

export async function GET(): Promise<Response> {
  try {
    const supabase = await createServerClient();
    const data = await getCategories(supabase);
    return success(data);
  } catch (error) {
    return routeError(error);
  }
}
