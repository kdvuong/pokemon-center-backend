import { IsNotEmpty } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreateGoogleUserDto extends CreateUserDto {
  @IsNotEmpty()
  googleId: string;
}
