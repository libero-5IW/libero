import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { TwoFactorAuthService } from './2fa/2fa.service';
import { UserService } from '../user/user.service';

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

    const isValid = this.twoFAService.verifyToken(user.twoFactorSecret, body.token);

    if (!isValid) throw new UnauthorizedException('Invalid 2FA code');

    // Now issue JWT
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('me')
  getAuthInfo(@CurrentUser() user: JwtPayload) {
    return {
      userId: user.userId,
      email: user.email,
    };
  }
}
