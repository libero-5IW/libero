import { Test, TestingModule } from '@nestjs/testing';
import { ContractTemplateService } from '../../src/resources/contract-template/contract-template.service';
import { PrismaService } from '../../src/database/prisma/prisma.service';
import { UserService } from '../../src/resources/user/user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as generateCopyNameUtil from '../../src/common/utils/generate-copy-name.util';

jest
  .spyOn(generateCopyNameUtil, 'generateCopyName')
  .mockResolvedValue('Contract Template Copy');

const mockPrismaService = {
  contractTemplate: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  contractTemplateVariable: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrismaService)),
};

const mockUserService = {
  getUserOrThrow: jest.fn(),
};

describe('ContractTemplateService', () => {
  let service: ContractTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractTemplateService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<ContractTemplateService>(ContractTemplateService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new contract template', async () => {
      mockUserService.getUserOrThrow.mockResolvedValue(true);
      mockPrismaService.contractTemplate.findFirst.mockResolvedValue(null);
      mockPrismaService.contractTemplate.create.mockResolvedValue({
        id: '1',
        variables: [],
      });

      const dto = { name: 'Test Contract', contentHtml: '<p>Test</p>', variables: [] };

      const result = await service.create(dto as any);

      expect(mockUserService.getUserOrThrow).toHaveBeenCalled();
      expect(mockPrismaService.contractTemplate.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', '1');
    });

    it('should throw if contract template name exists', async () => {
      mockUserService.getUserOrThrow.mockResolvedValue(true);
      mockPrismaService.contractTemplate.findFirst.mockResolvedValue({ id: 'exists' });

      await expect(
        service.create({ name: 'Duplicate', contentHtml: '' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all contract templates', async () => {
      mockPrismaService.contractTemplate.findMany.mockResolvedValue([
        { id: '1', variables: [] },
      ]);
      const result = await service.findAll();
      expect(result.length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a contract template by id', async () => {
      mockPrismaService.contractTemplate.findUnique.mockResolvedValue({
        id: '1',
        variables: [],
      });
      const result = await service.findOne('1');
      expect(result).toHaveProperty('id', '1');
    });

    it('should throw if contract template not found', async () => {
      mockPrismaService.contractTemplate.findUnique.mockResolvedValue(null);
      await expect(service.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a contract template', async () => {
      mockPrismaService.contractTemplate.findUniqueOrThrow.mockResolvedValue({ id: '1' });
      mockPrismaService.contractTemplate.update.mockResolvedValue({
        id: '1',
        variables: [],
      });

      const result = await service.update('1', {
        name: 'Updated Contract',
        contentHtml: '<p>Updated</p>',
      } as any);

      expect(result).toHaveProperty('id', '1');
    });
  });

  describe('remove', () => {
    it('should delete a contract template', async () => {
      mockPrismaService.contractTemplate.findUnique.mockResolvedValue({
        id: '1',
        variables: [],
      });
      mockPrismaService.contractTemplate.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');

      expect(result).toHaveProperty('id', '1');
    });
  });

  describe('duplicate', () => {
    it('should duplicate a contract template', async () => {
      mockPrismaService.contractTemplate.findUnique.mockResolvedValue({
        id: '1',
        name: 'Original Contract',
        userId: '123',
        variables: [],
      });
      mockPrismaService.contractTemplate.create.mockResolvedValue({
        id: '2',
        variables: [],
      });

      const result = await service.duplicate('1');

      expect(result).toHaveProperty('id', '2');
      expect(generateCopyNameUtil.generateCopyName).toHaveBeenCalled();
    });
  });
});
