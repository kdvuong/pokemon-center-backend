import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Pokemon } from './entities/Pokemon.entity';
import { Team } from './entities/Team.entity';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Pokemon, User])],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
