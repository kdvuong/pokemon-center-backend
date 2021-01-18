import { UserDto } from 'src/users/dto/user.dto';
import { User } from 'src/users/entities/user.entity';

export const toUserDto = (data: User): UserDto => {
  const { id, email } = data;
  const userDto: UserDto = { id, email };
  return userDto;
};
