export interface SignUpWithEmailRequest {
  email: string;
  password: string;
  name: string;
  redirectPath?: string;
}

export interface SignInWithEmailRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  redirectPath?: string;
}

export interface UpdatePasswordRequest {
  password: string;
}
