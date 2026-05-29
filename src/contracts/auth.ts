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

export interface RequestEmailVerificationRequest {
  email: string;
}

export interface RequestEmailVerificationResponse {
  challengeId: string;
  expiresAt: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailOtpResponse {
  verificationToken: string;
  expiresAt: string;
}

export interface CompleteEmailSignupRequest {
  email: string;
  verificationToken: string;
  password: string;
  name: string;
}
