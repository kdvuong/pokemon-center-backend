import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsernamesService } from '../usernames.service';
import { GoogleUser } from './entities/google-user.entity';
import { GoogleUsersService } from './google-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, GoogleUser])],
  providers: [GoogleUsersService, UsernamesService],
  exports: [GoogleUsersService],
})
export class GoogleUsersModule {}
