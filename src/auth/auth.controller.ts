import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoginGoogleUserDto } from 'src/users/google/dto/login-google-user.dto';
import { CreateLocalUserDto } from 'src/users/local/dto/create-local-user.dto';
import { LoginLocalUserDto } from 'src/users/local/dto/login-local-user.dto';
import { AuthService } from './auth.service';
import { AccessPayload } from './interface/access-payload';
import { CredentialTokens } from './interface/credential-tokens';
import { RegistrationStatus } from './interface/registration-status';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public async register(
    @Body() createUserDto: CreateLocalUserDto,
  ): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(
      createUserDto,
    );
    if (!result.success) {
      throw new HttpException('Failed to register', result.statusCode);
    }
    return result;
  }

  @Post('login')
  public async login(
    @Res({ passthrough: true }) response: Response,
    @Body() loginUserDto: LoginLocalUserDto,
  ): Promise<AccessPayload> {
    const loginStatus = await this.authService.login(loginUserDto);
    return this.processCredentialTokens(loginStatus, response);
  }

  @Post('google')
  public async googleLogin(
    @Res({ passthrough: true }) response: Response,
    @Body() loginUserDto: LoginGoogleUserDto,
  ): Promise<AccessPayload> {
    const loginStatus = await this.authService.googleLogin(loginUserDto);
    return this.processCredentialTokens(loginStatus, response);
  }

  @Post('logout')
  public async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('jwt', null, {
      httpOnly: true,
      path: '/auth/renew-token',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
  }

  @Post('renew-token')
  public async renewToken(@Req() request: Request): Promise<AccessPayload> {
    const accessPayload = await this.authService.renewToken(
      request.cookies.jwt,
    );
    return accessPayload;
  }

  private processCredentialTokens(
    tokens: CredentialTokens,
    response: Response,
  ): AccessPayload {
    const { accessToken, refreshToken } = tokens;
    response.cookie('jwt', refreshToken, {
      httpOnly: true,
      path: '/auth/renew-token',
      expires: new Date(Date.now() + 1000 * 3600 * 24 * 7),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return { accessToken };
  }
}
