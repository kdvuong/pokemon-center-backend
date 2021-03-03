import { AccessPayload } from './access-payload';

export interface LoginStatus {
  refreshToken: string;
  accessPayload: AccessPayload;
}
