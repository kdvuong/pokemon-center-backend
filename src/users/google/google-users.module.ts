import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleUser } from '../entities/google-user.entity';
import { User } from '../entities/user.entity';
import { GoogleUsersService } from './google-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, GoogleUser])],
  providers: [GoogleUsersService],
  exports: [GoogleUsersService],
})
export class GoogleUsersModule {}
