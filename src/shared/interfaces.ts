import { Request } from 'express';
export interface UserRequest extends Request {
  user: JwtPayload;
}

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
  name: string;
  discriminator: number;
}

export interface LoginResponse {
  accessToken: string;
  name: string;
  discriminator: number;
}
