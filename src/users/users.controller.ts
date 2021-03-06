import { Get, Req, UseGuards } from '@nestjs/common';
import { Body, Controller, Patch } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRequest } from 'src/shared/interfaces';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('update_username')
  updateUsername(
    @Req() req: UserRequest,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ) {
    return this.usersService.updateUsername(req.user.id, updateUsernameDto);
  }

  @Get('get')
  get(@Req() req: UserRequest) {
    return this.usersService.findOne(req.user.id);
  }
}
