import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { TwoFaAuthGuard } from './guards/twofa-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
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

    @Post('twofa/enable')
  async enableTwoFa(@Req() req: Request) {
    return this.authService.enableTwoFa(req.user.email);
  }

  @Post('twofa/disable')
  @UseGuards(TwoFaAuthGuard)
  async disableTwoFa(@Req() req: Request) {
    return this.authService.disableTwoFa(req.user.email);
  }

  @Post('twofa/verify')
  @UseGuards(TwoFaAuthGuard)
  async verifyTwoFa(@Req() req: Request) {
    return this.authService.verifyTwoFa(req.user.email, req.body.token);
  }

  @Get('twofa/secret')
  @UseGuards(TwoFaAuthGuard)
  async getTwoFaSecret(@Req() req: Request) {
    return this.authService.getTwoFaSecret(req.user.email);
  }
}
