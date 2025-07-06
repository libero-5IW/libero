import {
  Controller,
  Get,
  Post,
  Body,
  UnauthorizedException,
  Query,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { TwoFactorAuthService } from './2fa/2fa.service';
import { UserService } from '../user/user.service';
import { RequestResetPasswordDto } from './dto/request-reset-password';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly twoFAService: TwoFactorAuthService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) throw new UnauthorizedException();

    if (user.isTwoFactorEnabled) {
      // Don't return JWT yet
      return { twoFactorRequired: true, userId: user.id };
    }

    return this.authService.login(user);
  }

  @Public()
  @Post('2fa/verify')
  async verify2fa(@Body() body: { userId: string; token: string }) {
    const user = await this.userService.findOne(body.userId);
    if (!user || !user.twoFactorSecret) throw new UnauthorizedException();

    const isValid = this.twoFAService.verifyToken(
      user.twoFactorSecret,
      body.token,
    );

    if (!isValid) throw new UnauthorizedException('Invalid 2FA code');

    // Now issue JWT
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('request-reset-password')
  async requestResetPassword(@Body() body: RequestResetPasswordDto) {
    await this.authService.requestPasswordReset(body.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body.token, body.newPassword);
  }

  @Public()
  @Get('reset-password/validate')
  async validateResetTokenPublic(@Query('token') token: string) {
    await this.authService.validateResetToken(token);
  }

  @Get('me')
  async getAuthInfo(@CurrentUser() user: any) {
    const userInDb = await this.userService.findOne(user.userId);
    if (!userInDb) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    return {
      userId: user.userId,
      email: user.email,
    };
  }

  @Public()
  @Get('is-authenticated')
  async isAuthenticated(
    @Req() req: { headers: Record<string, string> },
  ): Promise<boolean> {
    const authHeader = req.headers?.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    const result = await this.authService.isTokenValid(token);

    return result;
  }
}
