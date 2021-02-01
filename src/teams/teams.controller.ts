import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRequest } from 'src/shared/interfaces';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamsService } from './teams.service';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get('/')
  public findAll(@Req() req: UserRequest) {
    return this.teamsService.findAll(req.user.id);
  }

  @Post('/')
  public create(@Req() req: UserRequest, @Body() payload: CreateTeamDto) {
    return this.teamsService.create(req.user.id, payload);
  }

  @Post('/add_pokemon/:id')
  public addPokemon(
    @Param('id') id: string,
    @Body() payload: CreatePokemonDto,
  ) {
    return this.teamsService.addPokemon(id, payload);
  }
}
