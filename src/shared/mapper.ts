import { UserDto } from 'src/users/dto/user.dto';
import { User } from 'src/users/entities/user.entity';

export const toUserDto = (data: User): UserDto => {
  const { id, email, name, tag } = data;
  const userDto: UserDto = { id, email, username: { name, tag } };
  return userDto;
};
