export interface JwtPayload {
  id: string;
  email: string;
}

export interface RegistrationStatus {
  success: boolean;
  statusCode: number;
}

export interface LoginStatus {
  refreshToken: string;
  accessToken: string;
}

export interface AccessToken {
  accessToken: string;
}
