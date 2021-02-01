import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { pokemonDataMap } from 'src/data/pokemonDataMap';
import { toTeamDto } from 'src/shared/mapper';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamDto } from './dto/team.dto';
import { Pokemon } from './entities/Pokemon.entity';
import { Team } from './entities/Team.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Pokemon)
    private readonly pokemonRepo: Repository<Pokemon>,
  ) {}

  async findAll(userId: string) {
    return this.teamRepo.find({
      where: { user: { id: userId } },
      relations: ['pokemons'],
    });
  }

  async create(userId: string, createTeamDto: CreateTeamDto): Promise<TeamDto> {
    const user = await this.userRepo.findOneOrFail(userId);
    const teamName = createTeamDto.name ?? 'Team Name';

    const team = this.teamRepo.create({
      user,
      name: teamName,
    });

    await this.teamRepo.save(team);

    return toTeamDto(team);
  }

  async addPokemon(teamId: string, createPokemonDto: CreatePokemonDto) {
    if (!this.validate(createPokemonDto)) {
      throw new HttpException(
        'Invalid create pokemon request',
        HttpStatus.BAD_REQUEST,
      );
    }

    const team = await this.teamRepo.findOneOrFail(teamId);
    const pokemon = this.pokemonRepo.create({ ...createPokemonDto, team });
    return this.pokemonRepo.save(pokemon);
  }

  private validate(dto: CreatePokemonDto) {
    const {
      pokemon_id,
      ability_id,
      moves,
      hp_ev,
      attack_ev,
      defense_ev,
      special_attack_ev,
      special_defense_ev,
      speed_ev,
    } = dto;
    const pokemonData = pokemonDataMap.get(pokemon_id);

    if (!pokemonData) {
      throw new HttpException('Invalid pokemon id', HttpStatus.BAD_REQUEST);
    }

    if (
      !this.validateEvs([
        hp_ev,
        attack_ev,
        defense_ev,
        special_attack_ev,
        special_defense_ev,
        speed_ev,
      ])
    ) {
      throw new HttpException('EV total is invalid', HttpStatus.BAD_REQUEST);
    }

    if (!this.validateMoves(moves, pokemonData.moveset)) {
      throw new HttpException(
        'Moves contain unlearnable move by this pokemon',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!this.validateAbilities(ability_id, pokemonData.abilities)) {
      throw new HttpException('Invalid ability', HttpStatus.BAD_REQUEST);
    }

    return true;
  }

  private validateMoves(moves: number[], moveset: number[]) {
    return moves.every((m) => moveset.includes(m));
  }

  private validateEvs(evs: number[]) {
    return evs.reduce((a, b) => a + b, 0) <= 508;
  }

  private validateAbilities(abilityId: number, abilities: number[]) {
    console.log(abilities);
    return abilities.includes(abilityId);
  }
}
