import { PokemonDto } from 'src/teams/dto/pokemon.dto';
import { TeamDto } from 'src/teams/dto/team.dto';
import { Pokemon } from 'src/teams/entities/Pokemon.entity';
import { Team } from 'src/teams/entities/Team.entity';
import { UserDto } from 'src/users/dto/user.dto';
import { User } from 'src/users/entities/user.entity';

export const toUserDto = (data: User): UserDto => {
  const { id, email, name, tag } = data;
  const userDto: UserDto = { id, email, username: { name, tag } };
  return userDto;
};

export const toTeamDto = (data: Team): TeamDto => {
  const { id, name, pokemons } = data;
  const teamDto: TeamDto = { id, name, pokemons };
  return teamDto;
};

export const toPokemonDto = (data: Pokemon): PokemonDto => {
  const { team, ...rest } = data;
  const pokemonDto: PokemonDto = { ...rest };
  return pokemonDto;
};
