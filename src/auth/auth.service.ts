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
import { CredentialTokens } from './interface/credential-tokens';
import { AccessPayload } from './interface/access-payload';
import { AccessTokenPayload } from './interface/access-token-payload';
import { TokenExpiredError } from 'jsonwebtoken';

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

  async login(loginUserDto: LoginLocalUserDto): Promise<CredentialTokens> {
    // find user in db
    const { id } = await this.localUsersService.findByLogin(loginUserDto);

    // generate and sign token
    const accessToken = this.generateAccessToken(id);
    const refreshToken = this.generateRefreshToken(id);

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateAccessToken(userId: string): string {
    const payload: AccessTokenPayload = {
      id: userId,
    };
    const options: JwtSignOptions = {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_EXPIRESIN,
    };
    const token = this.jwtService.sign(payload, options);
    return token;
  }

  private generateRefreshToken(userId: string): string {
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
      return {
        accessToken: this.generateAccessToken(id),
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

  async googleLogin(dto: LoginGoogleUserDto): Promise<CredentialTokens> {
    const { id } = await this.googleUsersService.findByOAuth(dto);
    // generate and sign token
    const accessToken = this.generateAccessToken(id);
    const refreshToken = this.generateRefreshToken(id);

    return {
      accessToken,
      refreshToken,
    };
  }
}
