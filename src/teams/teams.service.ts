import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { toTeamDto } from 'src/shared/mapper';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { PokemonDto } from './dto/pokemon.dto';
import { TeamDto } from './dto/team.dto';
import { Pokemon } from './entities/Pokemon.entity';
import { Team } from './entities/Team.entity';
import { PokemonsService } from './pokemons.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Pokemon)
    private readonly pokemonRepo: Repository<Pokemon>,
    private readonly pokemonsService: PokemonsService,
  ) {}

  async findAll(userId: string) {
    return this.teamRepo.find({
      where: { user: { id: userId } },
      relations: ['pokemons'],
    });
  }

  async findOne(userId: string, teamId: string, strict = false) {
    return strict
      ? this.teamRepo.findOneOrFail({
          where: { user: { id: userId }, id: teamId },
          relations: ['pokemons'],
        })
      : this.teamRepo.findOne({
          where: { user: { id: userId }, id: teamId },
          relations: ['pokemons'],
        });
  }

  async create(userId: string, createTeamDto: CreateTeamDto): Promise<TeamDto> {
    const user = await this.userRepo.findOneOrFail(userId);
    const teamName = !createTeamDto.name ? 'Team name' : createTeamDto.name;
    const team = this.teamRepo.create({
      user,
      name: teamName,
    });

    await this.teamRepo.save(team);

    return toTeamDto(team);
  }

  async delete(userId: string, teamId: string) {
    return this.teamRepo.delete({ id: teamId, user: { id: userId } });
  }

  async addPokemon(
    userId: string,
    teamId: string,
    createPokemonDto: CreatePokemonDto,
  ): Promise<PokemonDto> {
    const team = await this.findOne(userId, teamId, true);
    if (team.pokemons.length < 6) {
      return this.pokemonsService.create(userId, team, createPokemonDto);
    } else {
      throw new HttpException(
        'A team can only have 6 pokemons. Please reduce team size before adding more.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
