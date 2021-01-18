import { IsNotEmpty } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreateLocalUserDto extends CreateUserDto {
  @IsNotEmpty()
  password: string;
}
