import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { User } from './entities/user.entity';
import { UsernamesService } from './usernames.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly usernamesService: UsernamesService,
  ) {}

  async updateUsername(userId: string, updateUsernameDto: UpdateUsernameDto) {
    const user = await this.userRepo.findOneOrFail({ id: userId });
    const { name, discriminator, acceptNewDiscriminator } = updateUsernameDto;
    if (name === user.name && discriminator === user.discriminator) {
      throw new HttpException('No change', HttpStatus.BAD_REQUEST);
    }

    try {
      const {
        name: newName,
        discriminator: newDiscriminator,
      } = await this.usernamesService.getAvailableUsername(
        name ?? user.name,
        discriminator ?? user.discriminator,
        acceptNewDiscriminator,
      );

      user.name = newName;
      user.discriminator = newDiscriminator;

      return this.userRepo.save(user);
    } catch (err) {
      return new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
