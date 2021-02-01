import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { toUserDto } from 'src/shared/mapper';
import { Repository } from 'typeorm';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UsernamesService } from './usernames.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly usernamesService: UsernamesService,
  ) {}

  async findOne(userId: string): Promise<UserDto> {
    const user = await this.userRepo.findOne({ id: userId });
    return toUserDto(user);
  }

  async updateUsername(userId: string, updateUsernameDto: UpdateUsernameDto) {
    const user = await this.userRepo.findOneOrFail({ id: userId });
    const { name, tag, acceptNewTag } = updateUsernameDto;
    if (name === user.name && tag === user.tag) {
      throw new HttpException('No change', HttpStatus.BAD_REQUEST);
    }

    const {
      name: newName,
      tag: newTag,
    } = await this.usernamesService.getAvailableUsername(
      name ?? user.name,
      tag ?? user.tag,
      acceptNewTag,
    );

    user.name = newName;
    user.tag = newTag;

    return this.userRepo.save(user);
  }
}
