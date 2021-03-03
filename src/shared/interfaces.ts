import { Request } from 'express';
import { UserDto } from 'src/users/dto/user.dto';

export interface UserRequest extends Request {
  user: UserDto;
}
