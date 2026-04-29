import { createClient } from '@/lib/supabase/client';

export const authApi = {
  signInWithGoogle(redirectPath?: string) {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}${redirectPath ?? '/'}`;
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  },

  signInWithKakao(redirectPath?: string) {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}${redirectPath ?? '/'}`;
    return supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo },
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
