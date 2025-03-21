import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    return plainToInstance(UserEntity, user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => plainToInstance(UserEntity, user));
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return plainToInstance(UserEntity, user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const updatedUser = this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return plainToInstance(UserEntity, updatedUser);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const deletedUser = this.prisma.user.delete({
      where: { id },
    });

    return plainToInstance(UserEntity, deletedUser);
  }
}
