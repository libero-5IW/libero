import { Controller, Get, Body, Patch, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as Sentry from '@sentry/node';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findOne(user.userId);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.userId, updateUserDto);
  }

  @Patch('me/password')
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user.userId, changePasswordDto);
  }

  @Delete('me')
  deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.userService.remove(user.userId);
  }

  //Route de test pour Sentry
  @Get('sentry-test')
  triggerError() {
    throw new Error('Sentry backend test error triggered via /users/sentry-test');
  }
}
