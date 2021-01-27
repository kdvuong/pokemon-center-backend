import { Request } from 'express';
import { AccessTokenPayload } from 'src/auth/interface/access-token-payload';

export interface UserRequest extends Request {
  user: AccessTokenPayload;
}
