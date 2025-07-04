import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcryptjs';
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
    if (!user) throw new NotFoundException();

    const isMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
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
  }

  async getUserOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
    return user;
  }
}
