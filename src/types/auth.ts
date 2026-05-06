export type AuthProvider = 'google' | 'kakao' | 'email';

export interface AuthUser {
  id: string;
  email?: string;
  provider?: AuthProvider;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt?: number;
}

export interface AuthResult {
  user?: AuthUser;
  session?: AuthSession;
}
