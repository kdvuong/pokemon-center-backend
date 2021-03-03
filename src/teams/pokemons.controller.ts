import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRequest } from 'src/shared/interfaces';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonsService } from './pokemons.service';

@UseGuards(JwtAuthGuard)
@Controller('pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}
  @Patch('/:id')
  public update(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() payload: UpdatePokemonDto,
  ) {
    return this.pokemonsService.update(req.user.id, id, payload);
  }

  @Delete('/:id')
  public delete(@Req() req: UserRequest, @Param('id') id: string) {
    return this.pokemonsService.delete(req.user.id, id);
  }
}
