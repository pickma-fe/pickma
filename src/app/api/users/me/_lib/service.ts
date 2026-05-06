import type { SupabaseClient, User } from '@supabase/supabase-js';

import type { UserResponse } from '@/contracts/user';
import type { Database } from '@/lib/supabase/database';
import { getOrCreateUserByAuthUser } from '@/app/api/_lib/current-user';

export async function getUserMe(
  supabase: SupabaseClient<Database>,
  authUser: User
): Promise<UserResponse> {
  return getOrCreateUserByAuthUser(supabase, authUser);
}
