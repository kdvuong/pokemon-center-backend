import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoginStatus, RegistrationStatus } from 'src/shared/interfaces';
import { LoginGoogleUserDto } from 'src/users/google/dto/login-google-user.dto';
import { CreateLocalUserDto } from 'src/users/local/dto/create-local-user.dto';
import { LoginLocalUserDto } from 'src/users/local/dto/login-local-user.dto';
import { AuthService } from './auth.service';

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
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Post('login')
  public async login(
    @Res({ passthrough: true }) response: Response,
    @Body() loginUserDto: LoginLocalUserDto,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.authService.login(
      loginUserDto,
    );
    response.cookie('jwt', refreshToken, {
      httpOnly: true,
      path: '/auth/renew-token',
      expires: new Date(Date.now() + 1000 * 3600 * 24 * 7),
    });
    return { accessToken };
  }

  @Post('logout')
  public async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('jwt', null, {
      httpOnly: true,
      path: '/auth/renew-token',
    });
  }

  @Post('google')
  public async googleLogin(
    @Body() loginUserDto: LoginGoogleUserDto,
  ): Promise<LoginStatus> {
    return this.authService.googleLogin(loginUserDto);
  }

  @Post('renew-token')
  public renewToken(@Req() request: Request): { accessToken: string } {
    const accessToken = this.authService.renewToken(request.cookies.jwt);
    return { accessToken };
  }
}
