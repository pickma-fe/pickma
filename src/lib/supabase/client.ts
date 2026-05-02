import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/lib/supabase/database';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');

  return createBrowserClient<Database>(url, key);
}
