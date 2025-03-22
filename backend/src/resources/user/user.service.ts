// eslint-disable-next-line prettier/prettier
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: createUserDto,
    });

    return plainToInstance(UserEntity, user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();
    return plainToInstance(UserEntity, users);
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.getUserOrThrow(id);
    return plainToInstance(UserEntity, user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.getUserOrThrow(id);

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: { email: updateUserDto.email },
    });

    if (userWithSameEmail?.email && userWithSameEmail.id !== id) {
      throw new ConflictException('This email is already in use.');
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

  private async getUserOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
