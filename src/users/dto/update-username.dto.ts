import { IsBoolean, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @IsOptional()
  name?: string;

  @Min(1)
  @Max(9999)
  @IsOptional()
  tag?: number;

  @IsBoolean()
  @IsOptional()
  acceptNewTag: boolean;
}
