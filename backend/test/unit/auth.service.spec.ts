import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/resources/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { TwoFactorAuthService } from 'src/resources/auth/2fa/2fa.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

const jwtServiceMock = { sign: jest.fn(), verifyAsync: jest.fn() };
const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};
const userServiceMock = { getUserOrThrow: jest.fn() };
const twoFAMock = { verifyToken: jest.fn() };
const mailerServiceMock = {
  sendWelcomeEmail: jest.fn(),
  sendResetPasswordEmail: jest.fn(),
  sendPasswordResetSuccessEmail: jest.fn(),
  sendAccountLockedEmail: jest.fn(),
  sendPasswordExpirationEmail: jest.fn(),
};

const user = {
  id: 'user1',
  email: 'test@mail.com',
  password: 'hashed',
  firstName: 'Sarah',
  lastName: 'Salamani',
  loginAttempts: 0,
  lockedUntil: null,
  lastPasswordUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24),
};

const userWithExpiredPassword = {
  ...user,
  lastPasswordUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 61),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: TwoFactorAuthService, useValue: twoFAMock },
        { provide: MailerService, useValue: mailerServiceMock },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('retourne un token JWT', async () => {
      jwtServiceMock.sign.mockReturnValue('jwt-token');
      const result = await service.login(user as any);
      expect(result.token).toBe('jwt-token');
    });
  });

  describe('register', () => {
    it('crée un utilisateur et envoie un mail', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prismaMock.user.create.mockResolvedValue(user);
      const dto = { email: 'test@mail.com', password: '123456', firstName: 'Sarah', lastName: 'Salamani' };
      const result = await service.register(dto as any);
      expect(result.email).toBe('test@mail.com');
      expect(mailerServiceMock.sendWelcomeEmail).toHaveBeenCalled();
    });
    it('lève une erreur si email déjà utilisé', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      const dto = { email: 'test@mail.com', password: '123456', firstName: 'Sarah', lastName: 'Salamani' };
      await expect(service.register(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('requestPasswordReset', () => {
    it('envoie un mail de reset si user existe', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(user as any);
      prismaMock.user.update.mockResolvedValue({});
      await service.requestPasswordReset('test@mail.com');
      expect(mailerServiceMock.sendResetPasswordEmail).toHaveBeenCalled();
    });
    it('ne fait rien si user absent', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      const res = await service.requestPasswordReset('absent@mail.com');
      expect(res).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('réinitialise le mot de passe si token valide', async () => {
      jest.spyOn(service, 'validateResetToken').mockResolvedValue({ ...user, password: 'old' } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prismaMock.user.update.mockResolvedValue({});
      await service.resetPassword('token', 'newpass');
      expect(mailerServiceMock.sendPasswordResetSuccessEmail).toHaveBeenCalled();
    });
    it('lève une erreur si nouveau mot de passe identique', async () => {
      jest.spyOn(service, 'validateResetToken').mockResolvedValue({ ...user, password: 'old' } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(service.resetPassword('token', 'newpass')).rejects.toThrow(ConflictException);
    });
  });

  describe('isTokenValid', () => {
    it('retourne true si token valide', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue(true);
      const result = await service.isTokenValid('token');
      expect(result).toBe(true);
    });
    it('retourne false si token invalide', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('invalid'));
      const result = await service.isTokenValid('token');
      expect(result).toBe(false);
    });
  });

  describe('validateResetToken', () => {
    it('retourne l’utilisateur si token valide', async () => {
      prismaMock.user.findFirst.mockResolvedValue(user);
      const result = await service.validateResetToken('token');
      expect(result).toBe(user);
    });
    it('lève une erreur si token invalide', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      await expect(service.validateResetToken('token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('retourne l’utilisateur si email et mot de passe corrects', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.update.mockResolvedValue({ ...user, loginAttempts: 0 });
      jest.spyOn(service as any, 'checkPasswordExpiration').mockResolvedValue(undefined);
      const result = await service.validateUser('test@mail.com', '123456');
      expect(result.email).toBe('test@mail.com');
    });
    it('lève une erreur si email inconnu', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      await expect(service.validateUser('absent@mail.com', '123456')).rejects.toThrow(UnauthorizedException);
    });
    it('lève une erreur si mot de passe incorrect', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      jest.spyOn(service as any, 'handleFailedLoginAttempts').mockResolvedValue(undefined);
      await expect(service.validateUser('test@mail.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findByEmail', () => {
    it('retourne un user par email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      const result = await service.findByEmail('test@mail.com');
      expect(result).toBe(user);
    });
  });

  describe('validateTwoFa', () => {
    it('retourne true si 2FA ok', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue({ ...user, twoFactorSecret: 'secret' } as any);
      twoFAMock.verifyToken.mockResolvedValue(true);
      const result = await service.validateTwoFa('test@mail.com', '123456');
      expect(result).toBe(true);
    });
    it('retourne false si user absent', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      const result = await service.validateTwoFa('absent@mail.com', '123456');
      expect(result).toBe(false);
    });
    it('retourne false si pas de secret', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue({ ...user, twoFactorSecret: null } as any);
      const result = await service.validateTwoFa('test@mail.com', '123456');
      expect(result).toBe(false);
    });
  });
});
