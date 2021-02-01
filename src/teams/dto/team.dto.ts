import { Pokemon } from '../entities/Pokemon.entity';

export class TeamDto {
  id: string;
  name: string;
  pokemons: Pokemon[];
}
