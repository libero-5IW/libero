import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/resources/user/user.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { User } from '@prisma/client';
import { UserEntity } from 'src/resources/user/entities/user.entity';
import { UpdateUserDto } from 'src/resources/user/dto/update-user.dto';
import { ChangePasswordDto } from 'src/resources/user/dto/change-password.dto';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockUser: User = {
    id: 'user-id',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@example.com',
    password: 'hashed',
    companyName: 'Test Corp',
    addressLine: '1 rue de Paris',
    postalCode: '75000',
    city: 'Paris',
    country: 'France',
    legalStatus: 'SARL',
    siret: '12345678901234',
    tvaNumber: 'FR123456789',
    createdAt: new Date(),
    updatedAt: new Date(),
    twoFactorSecret: null,
    isTwoFactorEnabled: false,
    resetPasswordToken: null,
    resetPasswordTokenExpiry: null,
    lastPasswordUpdate: new Date(),
    resetTokenSource: null,
    loginAttempts: 0,
    lockedUntil: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              findFirst: jest.fn().mockResolvedValue(null),
              update: jest.fn().mockImplementation(({ where, data }) => {
                return Promise.resolve({ ...mockUser, ...data });
              }),
              delete: jest.fn().mockResolvedValue(mockUser),
            },
          },
        }        
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return a user by id', async () => {
    const result = await service.findOne('user-id');
    expect(result).toBeInstanceOf(UserEntity);
    expect(result.id).toBe('user-id');
  });

  it('should return a user by email', async () => {
    const result = await service.findByEmail('jean@example.com');
    expect(result.email).toBe('jean@example.com');
  });

  it('should update a user', async () => {
    const dto: UpdateUserDto = { firstName: 'Jean-Claude' } as any;
    const result = await service.update('user-id', dto);
    expect(result.firstName).toBe('Jean');
  });

  it('should throw if email already used by another user', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);
    await expect(
      service.update('other-id', { email: 'jean@example.com' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('should delete a user', async () => {
    const result = await service.remove('user-id');
    expect(result).toBeInstanceOf(UserEntity);
  });

  it('should change password correctly', async () => {
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('newHashed'));    
    const dto: ChangePasswordDto = {
      currentPassword: 'old',
      newPassword: 'new',
    };
    const result = await service.changePassword('user-id', dto);
    expect(result).toBeInstanceOf(UserEntity);
  });

  it('should throw if current password is wrong', async () => {
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));
    await expect(
      service.changePassword('user-id', {
        currentPassword: 'wrong',
        newPassword: 'new',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if new password is same as old', async () => {
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
    await expect(
      service.changePassword('user-id', {
        currentPassword: 'same',
        newPassword: 'same',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should set 2FA secret', async () => {
    const spy = jest.spyOn(prisma.user, 'update');
    await service.setTwoFactorSecret('user-id', 'secret');
    expect(spy).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { twoFactorSecret: 'secret' },
    });
  });

  it('should enable 2FA', async () => {
    const result = await service.enableTwoFactor('user-id');
    expect(result).toBeInstanceOf(UserEntity);
  });

  it('should disable 2FA', async () => {
    const spy = jest.spyOn(prisma.user, 'update');
    await service.disableTwoFactor('user-id');
    expect(spy).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null },
    });
  });

  it('should disable 2FA with password', async () => {
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
    const result = await service.disableTwoFactorWithPassword('user-id', 'pass');
    expect(result).toBeDefined();
  });

  it('should throw if password for disabling 2FA is incorrect', async () => {
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));
    await expect(service.disableTwoFactorWithPassword('user-id', 'wrong')).rejects.toThrow(UnauthorizedException);
  });
});