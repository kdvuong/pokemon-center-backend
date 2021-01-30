import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  tag?: number;

  @IsBoolean()
  @IsOptional()
  acceptNewTag: boolean;
}
