import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { pokemonDataMap } from 'src/data/pokemonDataMap';
import { toPokemonDto } from 'src/shared/mapper';
import { User } from 'src/users/entities/user.entity';
import { Connection, Repository } from 'typeorm';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/Pokemon.entity';
import { Team } from './entities/Team.entity';

@Injectable()
export class PokemonsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(Pokemon)
    private readonly pokemonRepo: Repository<Pokemon>,
    private readonly connection: Connection,
  ) {}

  async create(userId: string, team: Team, createPokemonDto: CreatePokemonDto) {
    if (!this.validate(createPokemonDto)) {
      throw new HttpException(
        'Invalid create pokemon request',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userRepo.findOneOrFail(userId);
    const pokemon = this.pokemonRepo.create({
      ...createPokemonDto,
      team,
      user,
    });
    await this.pokemonRepo.save(pokemon);
    return toPokemonDto(pokemon);
  }

  async update(
    userId: string,
    pokemonId: string,
    updatePokemonDto: UpdatePokemonDto,
  ) {
    const pokemon = await this.pokemonRepo.findOneOrFail({
      where: {
        id: pokemonId,
        user_id: userId,
      },
    });
    const updatedPokemon = { ...pokemon, ...updatePokemonDto };
    if (!this.validate(updatedPokemon)) {
      throw new HttpException(
        'Invalid update pokemon request',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.pokemonRepo.save(updatedPokemon);
  }

  async delete(userId: string, pokemonId: string) {
    return this.pokemonRepo.delete({
      id: pokemonId,
      user_id: userId,
    });
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
    return moves.every((m) => m === -1 || moveset.includes(m));
  }

  private validateEvs(evs: number[]) {
    return evs.reduce((a, b) => a + b, 0) <= 508;
  }

  private validateAbilities(abilityId: number, abilities: number[]) {
    console.log(abilities);
    return abilities.includes(abilityId);
  }
}
