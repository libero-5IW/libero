import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwoFactorAuthService } from './2fa/2fa.service';
import { TwoFactorAuthController } from './2fa/2fa.controller';
import { MailerModule } from '../../common/mailer/mailer.module';
@Module({
  imports: [
    ConfigModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    MailerModule,
  ],
  controllers: [AuthController, TwoFactorAuthController],
  providers: [AuthService, JwtStrategy, TwoFactorAuthService],
})
export class AuthModule {}
