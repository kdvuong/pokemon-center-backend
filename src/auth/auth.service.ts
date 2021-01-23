import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  JwtPayload,
  LoginStatus,
  RegistrationStatus,
} from 'src/shared/interfaces';
import { UserDto } from 'src/users/dto/user.dto';
import { CreateLocalUserDto } from 'src/users/local/dto/create-local-user.dto';
import { LoginLocalUserDto } from 'src/users/local/dto/login-local-user.dto';
import { LoginGoogleUserDto } from 'src/users/google/dto/login-google-user.dto';
import { LocalUsersService } from 'src/users/local/local-users.service';
import { GoogleUsersService } from 'src/users/google/google-users.service';

@Injectable()
export class AuthService {
  constructor(
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
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      name: user.name,
      discriminator: user.discriminator,
    };
  }

  private generateAccessToken(payload: JwtPayload): string {
    const options: JwtSignOptions = {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_EXPIRESIN,
    };
    const token = this.jwtService.sign(payload, options);
    return token;
  }

  private generateRefreshToken(payload: JwtPayload): string {
    const options: JwtSignOptions = {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_EXPIRESIN,
    };
    const token = this.jwtService.sign(payload, options);
    return token;
  }

  async validateLocalUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.localUsersService.findByPayload(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  renewToken(token: string): string {
    try {
      const { id, email } = this.jwtService.verify<UserDto>(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      return this.generateAccessToken({ id, email });
    } catch (err) {
      console.log(err);
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  async googleLogin(dto: LoginGoogleUserDto): Promise<LoginStatus> {
    const {
      id,
      email,
      name,
      discriminator,
    } = await this.googleUsersService.findByOAuth(dto);
    // generate and sign token
    const accessToken = this.generateAccessToken({ id, email });
    const refreshToken = this.generateRefreshToken({ id, email });

    return {
      accessToken,
      refreshToken,
      name,
      discriminator,
    };
  }
}
