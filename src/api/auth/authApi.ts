import { createClient } from '@/lib/supabase/client';

export const authApi = {
  signInWithGoogle() {
    const supabase = createClient();
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
  },

  signInWithKakao() {
    const supabase = createClient();
    return supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/` },
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
