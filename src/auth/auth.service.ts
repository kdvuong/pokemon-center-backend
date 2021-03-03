import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CreateLocalUserDto } from 'src/users/local/dto/create-local-user.dto';
import { LoginLocalUserDto } from 'src/users/local/dto/login-local-user.dto';
import { LoginGoogleUserDto } from 'src/users/google/dto/login-google-user.dto';
import { LocalUsersService } from 'src/users/local/local-users.service';
import { GoogleUsersService } from 'src/users/google/google-users.service';
import { RefreshTokenPayload } from './interface/refresh-token-payload';
import { UsersService } from 'src/users/users.service';
import { RegistrationStatus } from './interface/registration-status';
import { LoginStatus } from './interface/login-status';
import { AccessPayload } from './interface/access-payload';
import { AccessTokenPayload } from './interface/access-token-payload';
import { TokenExpiredError } from 'jsonwebtoken';
import { UserDto } from 'src/users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly localUsersService: LocalUsersService,
    private readonly googleUsersService: GoogleUsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userDto: CreateLocalUserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      statusCode: 200,
    };
    try {
      await this.localUsersService.create(userDto);
    } catch (err) {
      status = {
        success: false,
        statusCode: err.status,
      };
    }
    return status;
  }

  async login(loginUserDto: LoginLocalUserDto): Promise<LoginStatus> {
    // find user in db
    const user = await this.localUsersService.findByLogin(loginUserDto);

    // generate and sign token
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    const accessPayload: AccessPayload = {
      accessToken,
      user,
    };

    return {
      accessPayload,
      refreshToken,
    };
  }

  private generateAccessToken(userDto: UserDto): string {
    const payload: AccessTokenPayload = {
      user: userDto,
    };
    const options: JwtSignOptions = {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_EXPIRESIN,
    };
    const token = this.jwtService.sign(payload, options);
    return token;
  }

  private generateRefreshToken(userId: string) {
    const payload: RefreshTokenPayload = {
      id: userId,
    };
    const options: JwtSignOptions = {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_EXPIRESIN,
    };
    const token = this.jwtService.sign(payload, options);
    return token;
  }

  async renewToken(token: string): Promise<AccessPayload> {
    try {
      const { id } = this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      const user = await this.usersService.findOne(id);
      return {
        accessToken: this.generateAccessToken(user),
        user,
      };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new HttpException(
          'Expired refresh token',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }
  }

  async googleLogin(dto: LoginGoogleUserDto): Promise<LoginStatus> {
    const user = await this.googleUsersService.findByOAuth(dto);
    // generate and sign token
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    const accessPayload: AccessPayload = {
      accessToken,
      user,
    };

    return {
      accessPayload,
      refreshToken,
    };
  }
}
