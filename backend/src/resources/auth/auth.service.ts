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
import { MailerService } from 'src/common/mailer/mailer.service';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
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
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/new-password?token=${token}`;
    await this.mailerService.sendResetPasswordEmail(email, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.validateResetToken(token);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
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
    const user = await this.findByEmail(email);
    if (!user)
      throw new UnauthorizedException('Email ou mot de passe incorrect.');

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword)
      throw new UnauthorizedException('Email ou mot de passe incorrect.');

    return user;
  }

  findByEmail(mail: string) {
    const email = mail.trim().toLowerCase();
    return this.prisma.user.findUnique({ where: { email } });
  }
}
