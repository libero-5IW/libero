import { Controller, Post, Body, Req, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import { TwoFactorAuthService } from './2fa.service';
import { UserService } from '../../user/user.service'; // adjust import as needed
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // adjust import as needed
import * as bcrypt from 'bcryptjs';

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
    // Fetch the raw user from DB (not the DTO/entity)
    const user = await this.usersService.getUserOrThrow(req.user.userId);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    await this.usersService.disableTwoFactor(req.user.userId);
    return { success: true };
  }
}