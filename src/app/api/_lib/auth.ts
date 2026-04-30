import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServerClient } from '@/lib/supabase/server';

export async function requireAuth() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODE.UNAUTHORIZED, 401);
  }
  return user;
}

export async function requireSeller() {
  // Phase 3에서 DB role 조회로 보강
  return requireAuth();
}

export async function requireAdmin() {
  // Phase 3에서 DB role 조회로 보강
  return requireAuth();
}
