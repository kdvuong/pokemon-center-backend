import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { toUserDto } from 'src/shared/mapper';
import { Repository } from 'typeorm';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { CreateLocalUserDto } from './dto/create-local-user.dto';
import { LoginLocalUserDto } from './dto/login-local-user.dto';
import { LocalUser } from './entities/local-user.entity';

@Injectable()
export class LocalUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(LocalUser)
    private readonly localUserRepo: Repository<LocalUser>,
  ) {}

  async findOne(options?: Record<string, unknown>): Promise<UserDto> {
    const user = await this.localUserRepo.findOne(options);
    return toUserDto(user);
  }

  async findByLogin({ email, password }: LoginLocalUserDto): Promise<UserDto> {
    const user = await this.localUserRepo.findOne({ where: { email } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    // compare passwords
    const areEqual = await compare(password, user.password);
    if (!areEqual) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return toUserDto(user);
  }

  async findByPayload({ email }: any): Promise<UserDto> {
    return await this.findOne({
      where: { email },
    });
  }

  async create(userDto: CreateLocalUserDto): Promise<UserDto> {
    const { email, password } = userDto;

    // check if the user exists in the db
    const userInDb = await this.userRepo.findOne({
      where: { email },
    });
    if (userInDb) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const user: LocalUser = this.localUserRepo.create({ email, password });
    await this.localUserRepo.save(user);
    return toUserDto(user);
  }
}
