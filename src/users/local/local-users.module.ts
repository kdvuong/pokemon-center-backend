import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { LocalUser } from './entities/local-user.entity';
import { LocalUsersService } from './local-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, LocalUser])],
  providers: [LocalUsersService],
  exports: [LocalUsersService],
})
export class LocalUsersModule {}
