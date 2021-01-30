import { Controller, Get, Post } from '@nestjs/common';

@Controller('teams')
export class TeamsController {
  @Get('/')
  public findAll() {
    return [];
  }

  @Post('/')
  public create() {
    return null;
  }
}
