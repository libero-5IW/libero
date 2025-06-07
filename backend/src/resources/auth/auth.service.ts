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
import { speakeasy } from 'speakeasy';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
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

    return plainToInstance(UserEntity, user);
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

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async generateTwoFaSecret(email: string): Promise<string> {
    const secret = speakeasy.generateSecret({ length: 20 }).base32;
    await this.userService.updateTwoFaSecret(email, secret);
    return secret;
  }

  async validateTwoFa(email: string, token: string): Promise<UserEntity> {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.secretKey) {
      throw new UnauthorizedException();
    }
    const isValidToken = speakeasy.totp.verify({
      secret: user.secretKey,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (isValidToken) {
      return user;
    }
    throw new UnauthorizedException();
  }
}
