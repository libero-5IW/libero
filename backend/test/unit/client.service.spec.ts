import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from 'src/resources/client/client.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { CreateClientDto } from 'src/resources/client/dto/create-client.dto';
import { UpdateClientDto } from 'src/resources/client/dto/update-client.dto';

const mockClient: Client = {
  id: 'client-id',
  userId: 'user-id',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  phoneNumber: '0600000000',
  addressLine: '1 rue test',
  postalCode: '75001',
  city: 'Paris',
  country: 'France',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createDto: CreateClientDto = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  phoneNumber: '0600000000',
  addressLine: '1 rue test',
  postalCode: '75001',
  city: 'Paris',
  country: 'France',
};

const updateDto: UpdateClientDto = {
  ...createDto,
  phoneNumber: '0700000000',
};

describe('ClientService', () => {
  let service: ClientService;
  let prisma: PrismaService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    prisma = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should throw if client with email exists', async () => {
      jest.spyOn(userService, 'getUserOrThrow').mockResolvedValue(undefined);
      jest.spyOn(prisma.client, 'findUnique').mockResolvedValue(mockClient);

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create client successfully', async () => {
      jest.spyOn(userService, 'getUserOrThrow').mockResolvedValue(undefined);
      jest.spyOn(prisma.client, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.client, 'create')
        .mockResolvedValue({ ...mockClient });

      const result = await service.create('user-id', createDto);
      expect(result.email).toBe('jane.doe@example.com');
    });
  });

  describe('findOne', () => {
    it('should return client if found', async () => {
      jest.spyOn(prisma.client, 'findFirst').mockResolvedValue(mockClient);
      const result = await service.findOne('client-id', 'user-id');
      expect(result.id).toEqual(mockClient.id);
    });

    it('should throw if client not found', async () => {
      jest.spyOn(prisma.client, 'findFirst').mockResolvedValue(null);
      await expect(service.findOne('client-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return client', async () => {
      jest.spyOn(prisma.client, 'findFirst').mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.client, 'update').mockResolvedValue({
        ...mockClient,
        phoneNumber: updateDto.phoneNumber!,
      });

      const result = await service.update('client-id', 'user-id', updateDto);
      expect(result.phoneNumber).toBe('0700000000');
    });
  });

  describe('remove', () => {
    it('should delete client', async () => {
      jest.spyOn(prisma.client, 'findFirst').mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, 'delete').mockResolvedValue(mockClient);
      const result = await service.remove('client-id', 'user-id');
      expect(result.id).toBe('client-id');
    });
  });

  describe('search', () => {
    it('should return matching clients', async () => {
      jest
        .spyOn(prisma.client, 'findMany')
        .mockResolvedValue([mockClient]);
      const result = await service.search('user-id', 'jane');
      expect(result[0].email).toBe('jane.doe@example.com');
    });
  });
});
