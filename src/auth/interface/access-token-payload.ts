import { UserDto } from 'src/users/dto/user.dto';

export interface AccessTokenPayload {
  user: UserDto;
}
