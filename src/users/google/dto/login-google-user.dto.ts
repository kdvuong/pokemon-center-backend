import { IsNotEmpty } from 'class-validator';

export class LoginGoogleUserDto {
  @IsNotEmpty()
  readonly googleAccessToken: string;
}
