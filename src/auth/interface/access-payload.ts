import { UserDto } from 'src/users/dto/user.dto';

export interface AccessPayload {
  accessToken: string;
  user: UserDto;
}
