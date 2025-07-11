import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from '../user/entities/user.entity';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { TwoFactorAuthService } from './2fa/2fa.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import { ResetTokenSource } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly twoFAService: TwoFactorAuthService,
    private readonly mailerService: MailerService,
  ) {}

  async login(user: UserEntity) {
    const payload = { userId: user.id, email: user.email };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: RegisterDto): Promise<UserEntity> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Un utilisateur avec cet e-mail existe déjà.',
      );
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    await this.mailerService.sendWelcomeEmail(user.email, user.firstName);

    return plainToInstance(UserEntity, user);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    const tokenExpiry = addHours(new Date(), 1);

    await this.prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: tokenExpiry,
        resetTokenSource: ResetTokenSource.RESET,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/new-password?token=${token}`;
    await this.mailerService.sendResetPasswordEmail(email, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.validateResetToken(token);

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new ConflictException(
        'Le nouveau mot de passe doit être différent de l’ancien.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        lastPasswordUpdate: new Date(),
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });
    await this.mailerService.sendPasswordResetSuccessEmail(user.email);
  }

  async isTokenValid(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token);
      return true;
    } catch {
      return false;
    }
  }

  async validateResetToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Lien de réinitialisation invalide ou expiré.',
      );
    }

    return user;
  }

  async validateUser(email: string, password: string) {
    let user = await this.findByEmail(email);
    console.log('password', password);

    if (!user)
      throw new UnauthorizedException('Email ou mot de passe incorrect.');

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const now = new Date();
      const remainingMs = user.lockedUntil.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / 60000);

      throw new UnauthorizedException(
        `Votre compte est temporairement bloqué. Veuillez réessayer dans ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
      );
    } else if (user.lockedUntil && user.lockedUntil <= new Date()) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: null,
          loginAttempts: 0,
        },
      });
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      await this.handleFailedLoginAttempts(user);
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    if (user.loginAttempts !== 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0 },
      });
    }

    await this.checkPasswordExpiration(user);

    return user;
  }

  private async handleFailedLoginAttempts(user: UserEntity): Promise<void> {
    const updatedAttempts = user.loginAttempts + 1;

    const updateData: any = { loginAttempts: updatedAttempts };

    if (updatedAttempts >= 5) {
      const lockDuration = 10 * 60 * 1000; // 10 min
      const lockedUntil = new Date(Date.now() + lockDuration);
      updateData.lockedUntil = lockedUntil;

      const token = randomBytes(32).toString('hex');
      const tokenExpiry = addHours(new Date(), 1);

      updateData.resetPasswordToken = token;
      updateData.resetPasswordTokenExpiry = tokenExpiry;
      updateData.resetTokenSource = ResetTokenSource.LOCKED;

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      const resetLink = `${process.env.FRONTEND_URL}/new-password?token=${token}`;
      await this.mailerService.sendAccountLockedEmail(
        user.email,
        resetLink,
        lockDuration / (1000 * 60),
      );

      throw new UnauthorizedException(
        `Votre compte est temporairement bloqué. Veuillez réessayer dans ${lockDuration / 60000} minutes.`,
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  }

  private async checkPasswordExpiration(user: UserEntity): Promise<void> {
    let errorMessage =
      'Un lien de réinitialisation vous a déjà été envoyé, vérifiez vos emails.';
    const lastUpdate = user.lastPasswordUpdate;
    const oneDay = 1000 * 60 * 60 * 24;
    const daysSinceLastUpdate =
      (Date.now() - new Date(lastUpdate).getTime()) / oneDay;

    const tokenStillValid =
      user.resetTokenSource === ResetTokenSource.EXPIRED &&
      user.resetPasswordToken &&
      user.resetPasswordTokenExpiry &&
      user.resetPasswordTokenExpiry > new Date();

    if (daysSinceLastUpdate >= 60 && !tokenStillValid) {
      errorMessage = 'Un lien de réinitialisation vous a été envoyé.';
      const token = randomBytes(32).toString('hex');
      const expiry = addHours(new Date(), 1);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: token,
          resetPasswordTokenExpiry: expiry,
          resetTokenSource: ResetTokenSource.EXPIRED,
        },
      });

      const resetLink = `${process.env.FRONTEND_URL}/new-password?token=${token}`;
      await this.mailerService.sendPasswordExpirationEmail(
        user.email,
        resetLink,
      );
    }

    if (daysSinceLastUpdate >= 60) {
      throw new UnauthorizedException(
        `Votre mot de passe a expiré. ${errorMessage}`,
      );
    }
  }

  findByEmail(mail: string) {
    const email = mail.trim().toLowerCase();
    return this.prisma.user.findUnique({ where: { email } });
  }

  async validateTwoFa(email: string, token: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user || !user.twoFactorSecret) return false;

    return this.twoFAService.verifyToken(user.twoFactorSecret, token);
  }
}
