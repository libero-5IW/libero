import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/resources/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { TwoFactorAuthService } from 'src/resources/auth/2fa/2fa.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { RegisterDto } from 'src/resources/auth/dto/register.dto';

const mockUser: User = {
  id: 'user-id',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'hashed',
  companyName: 'Libero Inc.',
  addressLine: '123 rue test',
  postalCode: '75000',
  city: 'Paris',
  country: 'France',
  legalStatus: 'SAS',
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

const registerDto: RegisterDto = {
  email: 'test@example.com',
  password: 'securepass',
  firstName: 'Test',
  lastName: 'User',
  companyName: 'Libero Inc.',
  addressLine: '123 rue test',
  postalCode: '75000',
  city: 'Paris',
  country: 'France',
  legalStatus: 'SAS',
  siret: '12345678901234',
  tvaNumber: 'FR123456789',
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-jwt'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: TwoFactorAuthService,
          useValue: {
            verifyToken: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
            sendResetPasswordEmail: jest.fn(),
            sendPasswordResetSuccessEmail: jest.fn(),
            sendAccountLockedEmail: jest.fn(),
            sendPasswordExpirationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    mailerService = module.get<MailerService>(MailerService);
  });

  describe('login', () => {
    it('should return JWT token', async () => {
      const result = await service.login(mockUser);
      expect(result).toEqual({ token: 'signed-jwt' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
      });
    });
  });

  describe('register', () => {
    it('should throw ConflictException if user exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should create a user and send welcome email', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed'));
      jest.spyOn(prisma.user, 'create').mockResolvedValue({ ...mockUser, password: 'hashed' });
      const result = await service.register(registerDto);
      expect(result.email).toEqual(registerDto.email);
      expect(mailerService.sendWelcomeEmail).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should throw if user not found', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      await expect(service.validateUser('x@x.com', '123')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is incorrect', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false)); 
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);
      await expect(service.validateUser(mockUser.email, 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user if credentials are valid', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(service as any, 'checkPasswordExpiration').mockResolvedValue(undefined);
      const result = await service.validateUser(mockUser.email, 'correct');
      expect(result).toEqual(mockUser);
    });
  });

  describe('isTokenValid', () => {
    it('should return true if token is valid', async () => {
      (jwtService.verifyAsync as jest.MockedFunction<typeof jwtService.verifyAsync>).mockResolvedValue({});
      expect(await service.isTokenValid('token')).toBe(true);
    });

    it('should return false if token is invalid', async () => {
      (jwtService.verifyAsync as jest.MockedFunction<typeof jwtService.verifyAsync>).mockRejectedValue(new Error());
      expect(await service.isTokenValid('invalid')).toBe(false);
    });
  });
});
