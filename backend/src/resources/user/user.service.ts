import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.getUserOrThrow(id);
    return plainToInstance(UserEntity, user);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
    return plainToInstance(UserEntity, user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.getUserOrThrow(id);

    if (updateUserDto.email) {
      const userWithSameEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new ConflictException('Cet e-mail est déjà utilisé.');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return plainToInstance(UserEntity, updatedUser);
  }

  async remove(id: string): Promise<UserEntity> {
    await this.getUserOrThrow(id);

    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    return plainToInstance(UserEntity, deletedUser);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    const isMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit être différent de l’ancien.',
      );
    }

    const newHashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: newHashedPassword,
        lastPasswordUpdate: new Date(),
      },
    });

    return plainToInstance(UserEntity, user);
  }

  async getUserOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
    return user;
  }

  async setTwoFactorSecret(userId: string, secret: string) {
    if (!userId) throw new Error("L'identifiant utilisateur est requis");
    return this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });
  }

  async enableTwoFactor(userId: string) {
    const updatedUser = this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });
    return plainToInstance(UserEntity, updatedUser);
  }

  async disableTwoFactor(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null },
    });
  }

  async disableTwoFactorWithPassword(userId: string, password: string) {
    const user = await this.getUserOrThrow(userId);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }
    return this.disableTwoFactor(userId);
  }
}
