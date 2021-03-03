import { IsOptional, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;
}
