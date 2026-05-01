import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/database';

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Missing Supabase service env vars');

  return createClient<Database>(url, key);
}
