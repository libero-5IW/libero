import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { TwoFactorAuthService } from './2fa.service';
import { UserService } from '../../user/user.service'; // adjust import as needed
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // adjust import as needed

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

    // Save secret temporarily to user (not enabled yet)
    await this.usersService.setTwoFactorSecret(user.id, secret.base32);

    return { qrCode, secret: secret.base32 };
  }

  @UseGuards(JwtAuthGuard)
  @Post('enable')
  async enable(@Req() req, @Body('token') token: string) {
    const user = await this.usersService.findOne(req.user.id);
    const isValid = this.twoFAService.verifyToken(user.twoFactorSecret, token);

    if (isValid) {
      await this.usersService.enableTwoFactor(req.user.id);
    }
    return { valid: isValid };
  }

  @UseGuards(JwtAuthGuard)
  @Post('disable')
  async disable(@Req() req, @Body('password') password: string) {
    // Optionally verify password before disabling
    await this.usersService.disableTwoFactor(req.user.id);
    return { success: true };
  }
}