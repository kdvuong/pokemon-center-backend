export interface JwtPayload {
  id: string;
  email: string;
}

export interface RegistrationStatus {
  success: boolean;
  message: string;
}

export interface LoginStatus {
  refreshToken: string;
  accessToken: string;
}
