import {
  ArrayMaxSize,
  IsBoolean,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePokemonDto {
  @IsNumber()
  pokemon_id: number;

  @IsString()
  nickname: string;

  @IsBoolean()
  shiny: boolean;

  @Min(1)
  @Max(100)
  level: number;

  @IsString()
  gender: string;

  @IsNumber()
  ability_id: number;

  @Min(1)
  @Max(20)
  @IsNumber()
  nature_id: number;

  @IsNumber({}, { each: true })
  @ArrayMaxSize(4)
  moves: number[];

  @Min(0)
  @Max(252)
  @IsNumber()
  hp_ev: number;

  @Min(0)
  @Max(252)
  @IsNumber()
  attack_ev: number;

  @Min(0)
  @Max(252)
  @IsNumber()
  defense_ev: number;

  @Min(0)
  @Max(252)
  @IsNumber()
  special_attack_ev: number;

  @Min(0)
  @Max(252)
  @IsNumber()
  special_defense_ev: number;

  @Min(0)
  @Max(252)
  @IsNumber()
  speed_ev: number;

  @Min(0)
  @Max(31)
  @IsNumber()
  hp_iv: number;

  @Min(0)
  @Max(31)
  @IsNumber()
  attack_iv: number;

  @Min(0)
  @Max(31)
  @IsNumber()
  defense_iv: number;

  @Min(0)
  @Max(31)
  @IsNumber()
  special_attack_iv: number;

  @Min(0)
  @Max(31)
  @IsNumber()
  special_defense_iv: number;

  @Min(0)
  @Max(31)
  @IsNumber()
  speed_iv: number;
}
