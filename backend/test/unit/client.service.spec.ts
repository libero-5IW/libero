import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from 'src/resources/client/client.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const prismaMock = {
  client: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
const userServiceMock = { getUserOrThrow: jest.fn() };

jest.mock('src/common/utils/csv-export.util', () => ({
  generateCSVExport: jest.fn(() => ({ filename: 'export.csv', content: 'csvdata' })),
}));

const user = { id: 'user1', email: 'test@mail.com' };
const client = {
  id: 'client1',
  userId: 'user1',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'client@mail.com',
  phoneNumber: '0600000000',
  addressLine: '1 rue de Paris',
  postalCode: '75000',
  city: 'Paris',
  country: 'France',
  createdAt: new Date(),
};

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile();
    service = module.get<ClientService>(ClientService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crée un client avec succès', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      prismaMock.client.findUnique.mockResolvedValue(null);
      prismaMock.client.create.mockResolvedValue(client);
      const dto = { firstName: 'Jean', lastName: 'Dupont', email: 'client@mail.com' };
      const result = await service.create('user1', dto as any);
      expect(result.email).toBe('client@mail.com');
      expect(prismaMock.client.create).toHaveBeenCalled();
    });
    it('lève une erreur si email déjà utilisé', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      prismaMock.client.findUnique.mockResolvedValue(client);
      const dto = { firstName: 'Jean', lastName: 'Dupont', email: 'client@mail.com' };
      await expect(service.create('user1', dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('retourne tous les clients', async () => {
      prismaMock.client.findMany.mockResolvedValue([client]);
      const result = await service.findAll('user1');
      expect(result[0].email).toBe('client@mail.com');
    });
  });

  describe('findOne', () => {
    it('retourne un client par id', async () => {
      prismaMock.client.findFirst.mockResolvedValue(client);
      const result = await service.findOne('client1', 'user1');
      expect(result.id).toBe('client1');
    });
    it('lève une erreur si le client est absent', async () => {
      prismaMock.client.findFirst.mockResolvedValue(null);
      await expect(service.findOne('client2', 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('met à jour un client', async () => {
      prismaMock.client.findFirst.mockResolvedValue(client);
      prismaMock.client.findUnique.mockResolvedValue(null);
      prismaMock.client.update.mockResolvedValue({ ...client, firstName: 'Paul' });
      const dto = { firstName: 'Paul' };
      const result = await service.update('client1', 'user1', dto as any);
      expect(result.firstName).toBe('Paul');
    });
    it('lève une erreur si email déjà utilisé pour un autre client', async () => {
      prismaMock.client.findFirst.mockResolvedValue(client);
      prismaMock.client.findUnique.mockResolvedValue({ ...client, id: 'autre' });
      const dto = { firstName: 'Paul' };
      await expect(service.update('client1', 'user1', dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('supprime un client', async () => {
      prismaMock.client.findFirst.mockResolvedValue(client);
      prismaMock.client.delete.mockResolvedValue(client);
      const result = await service.remove('client1', 'user1');
      expect(result.id).toBe('client1');
    });
  });

  describe('search', () => {
    it('retourne les clients filtrés', async () => {
      prismaMock.client.findMany.mockResolvedValue([client]);
      const result = await service.search('user1', 'Jean');
      expect(result[0].firstName).toBe('Jean');
    });
  });

  describe('exportToCSV', () => {
    it('exporte les clients en CSV', async () => {
      prismaMock.client.findMany.mockResolvedValue([client]);
      const result = await service.exportToCSV('user1', 'Jean');
      expect(result.filename).toBe('export.csv');
      expect(result.content).toBe('csvdata');
    });
  });
});
