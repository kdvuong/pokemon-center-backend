import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { toUserDto } from 'src/shared/mapper';
import { Repository } from 'typeorm';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { google } from 'googleapis';
import { LoginGoogleUserDto } from './dto/login-google-user.dto';
import { CreateGoogleUserDto } from './dto/create-google-user.dto';
import { GoogleUser } from './entities/google-user.entity';
import { UsernamesService } from '../usernames.service';

const { OAuth2 } = google.auth;

@Injectable()
export class GoogleUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(GoogleUser)
    private readonly googleUserRepo: Repository<GoogleUser>,
    private readonly usernamesService: UsernamesService,
  ) {}

  async findByOAuth(dto: LoginGoogleUserDto): Promise<UserDto> {
    const { googleAccessToken } = dto;
    const ClientId = process.env.GOOGLE_CLIENT_ID;
    const ClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const oauth2Client = new OAuth2(ClientId, ClientSecret);
    oauth2Client.setCredentials({ access_token: googleAccessToken });

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    try {
      const { data } = await oauth2.userinfo.get();
      const { id: googleId, email, verified_email } = data;

      if (!verified_email) {
        throw new HttpException(
          'Email is not verified',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const userInDb = await this.userRepo.findOne({
        where: { email },
      });

      if (userInDb) {
        console.log(userInDb);
        if (userInDb instanceof GoogleUser) {
          return toUserDto(userInDb);
        } else {
          throw new HttpException(
            'Email already registered',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      return this.create({ email, googleId });
    } catch (err) {
      throw new HttpException(
        'Invalid authentication credential',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async create(dto: CreateGoogleUserDto): Promise<UserDto> {
    const { email, googleId } = dto;
    const { name, tag } = await this.usernamesService.create();
    const user: GoogleUser = this.googleUserRepo.create({
      email,
      googleId,
      name,
      tag,
    });
    await this.googleUserRepo.save(user);
    return toUserDto(user);
  }
}
