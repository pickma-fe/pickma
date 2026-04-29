import { createClient } from '@/lib/supabase/client';

function buildRedirectTo(redirectPath?: string): string {
  const path =
    redirectPath ??
    new URLSearchParams(window.location.search).get('next') ??
    '/';
  return new URL(path, window.location.origin).toString();
}

export const authApi = {
  signInWithGoogle(redirectPath?: string) {
    const supabase = createClient();
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: buildRedirectTo(redirectPath) },
    });
  },

  signInWithKakao(redirectPath?: string) {
    const supabase = createClient();
    return supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: buildRedirectTo(redirectPath) },
    });
  },

  signOut() {
    const supabase = createClient();
    return supabase.auth.signOut();
  },

  getSession() {
    const supabase = createClient();
    return supabase.auth.getSession();
  },
};
