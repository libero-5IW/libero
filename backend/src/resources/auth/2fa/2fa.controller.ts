import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { TwoFactorAuthService } from './2fa.service';
import { UserService } from '../../user/user.service'; 
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('2fa')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFAService: TwoFactorAuthService,
    private readonly usersService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generate(@Req() req) {
    const user = req.user;
    const secret = this.twoFAService.generateSecret(user.email);
    const qrCode = await this.twoFAService.generateQrCode(secret.otpauth_url);

    await this.usersService.setTwoFactorSecret(user.userId, secret.base32);

    return { qrCode, secret: secret.base32 };
  }

  @UseGuards(JwtAuthGuard)
  @Post('enable')
  async enable(@Req() req, @Body('token') token: string) {
    const user = await this.usersService.findOne(req.user.userId);
    const isValid = this.twoFAService.verifyToken(user.twoFactorSecret, token);

    if (isValid) {
      await this.usersService.enableTwoFactor(req.user.userId);
    }
    return { valid: isValid };
  }

  @UseGuards(JwtAuthGuard)
  @Post('disable')
  async disable(@Req() req, @Body('password') password: string) {
    await this.usersService.disableTwoFactorWithPassword(req.user.userId, password);
    return { success: true };
  }
}
