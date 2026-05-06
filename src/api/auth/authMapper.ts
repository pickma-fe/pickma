import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

import type {
  AuthProvider,
  AuthResult,
  AuthSession,
  AuthUser,
} from '@/types/auth';

function toAuthProvider(provider?: string): AuthProvider | undefined {
  if (provider === 'google' || provider === 'kakao' || provider === 'email')
    return provider;
  return undefined;
}

export function mapAuthUser(user: SupabaseUser | null): AuthUser | undefined {
  if (!user) return undefined;

  return {
    id: user.id,
    email: user.email,
    provider: toAuthProvider(user.app_metadata.provider),
  };
}

export function mapAuthSession(
  session: Session | null
): AuthSession | undefined {
  if (!session) return undefined;

  const user = mapAuthUser(session.user);
  if (!user) return undefined;

  return {
    user,
    expiresAt: session.expires_at,
  };
}

export function mapAuthResult(
  user: SupabaseUser | null,
  session: Session | null
): AuthResult {
  return {
    user: mapAuthUser(user),
    session: mapAuthSession(session),
  };
}
