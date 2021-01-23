import { Req, UseGuards } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRequest } from 'src/shared/interfaces';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('updateUsername')
  updateUsername(
    @Req() req: UserRequest,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ) {
    return this.usersService.updateUsername(req.user.id, updateUsernameDto);
  }
}
