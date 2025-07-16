import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/resources/user/user.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const user = {
  id: 'user1',
  email: 'test@mail.com',
  password: 'hashed',
  firstName: 'Sarah',
  lastName: 'Salamani',
  isTwoFactorEnabled: false,
  twoFactorSecret: null,
  createdAt: new Date(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('retourne un user par id', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      const result = await service.findOne('user1');
      expect(result.email).toBe('test@mail.com');
    });
    it('lève une erreur si user absent', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('user2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('retourne un user par email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      const result = await service.findByEmail('test@mail.com');
      expect(result.email).toBe('test@mail.com');
    });
    it('lève une erreur si user absent', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.findByEmail('absent@mail.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('met à jour un user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.user.update.mockResolvedValue({ ...user, firstName: 'Paul' });
      const dto = { firstName: 'Paul' };
      const result = await service.update('user1', dto as any);
      expect(result.firstName).toBe('Paul');
    });
    it('lève une erreur si email déjà utilisé', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({ ...user, id: 'autre' });
      const dto = { email: 'autre@mail.com' };
      await expect(service.update('user1', dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('supprime un user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.user.delete.mockResolvedValue(user);
      const result = await service.remove('user1');
      expect(result.id).toBe('user1');
    });
  });

  describe('changePassword', () => {
    it('change le mot de passe si tout est ok', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed2');
      prismaMock.user.update.mockResolvedValue({ ...user, password: 'hashed2' });
      const dto = { currentPassword: 'old', newPassword: 'new' };
      const result = await service.changePassword('user1', dto as any);
      expect(result.email).toBe('test@mail.com');
    });
    it('lève une erreur si user absent', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const dto = { currentPassword: 'old', newPassword: 'new' };
      await expect(service.changePassword('user1', dto as any)).rejects.toThrow(NotFoundException);
    });
    it('lève une erreur si mot de passe actuel incorrect', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const dto = { currentPassword: 'old', newPassword: 'new' };
      await expect(service.changePassword('user1', dto as any)).rejects.toThrow(UnauthorizedException);
    });
    it('lève une erreur si nouveau mot de passe identique', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const dto = { currentPassword: 'same', newPassword: 'same' };
      await expect(service.changePassword('user1', dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserOrThrow', () => {
    it('retourne un user si trouvé', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      const result = await service.getUserOrThrow('user1');
      expect(result.email).toBe('test@mail.com');
    });
    it('lève une erreur si user absent', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.getUserOrThrow('user2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('setTwoFactorSecret', () => {
    it('met à jour le secret 2FA', async () => {
      prismaMock.user.update.mockResolvedValue({ ...user, twoFactorSecret: 'secret' });
      const result = await service.setTwoFactorSecret('user1', 'secret');
      expect(result.twoFactorSecret).toBe('secret');
    });
    it('lève une erreur si userId manquant', async () => {
      await expect(service.setTwoFactorSecret('', 'secret')).rejects.toThrow();
    });
  });

  describe('enableTwoFactor', () => {
    it('active le 2FA', async () => {
      prismaMock.user.update.mockResolvedValue({ ...user, isTwoFactorEnabled: true });
      const result = await service.enableTwoFactor('user1');
      expect(result.isTwoFactorEnabled).toBe(true);
    });
  });

  describe('disableTwoFactor', () => {
    it('désactive le 2FA', async () => {
      prismaMock.user.update.mockResolvedValue({ ...user, isTwoFactorEnabled: false, twoFactorSecret: null });
      const result = await service.disableTwoFactor('user1');
      expect(result.isTwoFactorEnabled).toBe(false);
    });
  });

  describe('disableTwoFactorWithPassword', () => {
    it('désactive le 2FA si mot de passe correct', async () => {
      jest.spyOn(service, 'getUserOrThrow').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.update.mockResolvedValue({ ...user, isTwoFactorEnabled: false, twoFactorSecret: null });
      const result = await service.disableTwoFactorWithPassword('user1', 'password');
      expect(result.isTwoFactorEnabled).toBe(false);
    });
    it('lève une erreur si mot de passe incorrect', async () => {
      jest.spyOn(service, 'getUserOrThrow').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.disableTwoFactorWithPassword('user1', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });
});
