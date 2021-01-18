import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginLocalUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}
