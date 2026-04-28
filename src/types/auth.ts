export type AuthProvider = 'google' | 'kakao';

export interface AuthUser {
  id: string;
  email: string;
  provider: AuthProvider;
}
