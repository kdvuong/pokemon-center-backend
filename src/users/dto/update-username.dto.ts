import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  discriminator?: number;

  @IsBoolean()
  acceptNewDiscriminator: boolean;
}
