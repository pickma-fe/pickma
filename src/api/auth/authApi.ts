import { createClient } from '@/lib/supabase/client';

function buildRedirectTo(redirectPath?: string): string {
  const rawPath =
    redirectPath ??
    new URLSearchParams(window.location.search).get('next') ??
    '/';
  const redirectUrl = new URL(rawPath, window.location.origin);

  if (redirectUrl.origin !== window.location.origin) {
    return new URL('/', window.location.origin).toString();
  }

  return redirectUrl.toString();
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
