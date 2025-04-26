import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceTemplateService } from '../../src/resources/invoice-template/invoice-template.service';
import { PrismaService } from '../../src/database/prisma/prisma.service';
import { UserService } from '../../src/resources/user/user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as generateCopyNameUtil from '../../src/common/utils/generate-copy-name.util';

jest
  .spyOn(generateCopyNameUtil, 'generateCopyName')
  .mockResolvedValue('Template Copy');

const mockPrismaService = {
  invoiceTemplate: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  invoiceTemplateVariable: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrismaService)),
};

const mockUserService = {
  getUserOrThrow: jest.fn(),
};

describe('InvoiceTemplateService', () => {
  let service: InvoiceTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceTemplateService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<InvoiceTemplateService>(InvoiceTemplateService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new invoice template', async () => {
      mockUserService.getUserOrThrow.mockResolvedValue(true);
      mockPrismaService.invoiceTemplate.findFirst.mockResolvedValue(null);
      mockPrismaService.invoiceTemplate.create.mockResolvedValue({
        id: '1',
        variables: [],
      });

      const dto = { name: 'Test Invoice', contentHtml: '<p>Invoice</p>', variables: [] };

      const result = await service.create(dto as any);

      expect(mockUserService.getUserOrThrow).toHaveBeenCalled();
      expect(mockPrismaService.invoiceTemplate.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', '1');
    });

    it('should throw if invoice template name exists', async () => {
      mockUserService.getUserOrThrow.mockResolvedValue(true);
      mockPrismaService.invoiceTemplate.findFirst.mockResolvedValue({ id: 'exists' });

      await expect(
        service.create({ name: 'Duplicate', contentHtml: '' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all invoice templates', async () => {
      mockPrismaService.invoiceTemplate.findMany.mockResolvedValue([
        { id: '1', variables: [] },
      ]);
      const result = await service.findAll();
      expect(result.length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an invoice template by id', async () => {
      mockPrismaService.invoiceTemplate.findUnique.mockResolvedValue({
        id: '1',
        variables: [],
      });
      const result = await service.findOne('1');
      expect(result).toHaveProperty('id', '1');
    });

    it('should throw if invoice template not found', async () => {
      mockPrismaService.invoiceTemplate.findUnique.mockResolvedValue(null);
      await expect(service.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an invoice template', async () => {
      mockPrismaService.invoiceTemplate.findUniqueOrThrow.mockResolvedValue({
        id: '1',
      });
      mockPrismaService.invoiceTemplate.update.mockResolvedValue({
        id: '1',
        variables: [],
      });

      const result = await service.update('1', {
        name: 'Updated Invoice',
        contentHtml: '<p>Updated</p>',
      } as any);

      expect(result).toHaveProperty('id', '1');
    });
  });

  describe('remove', () => {
    it('should delete an invoice template', async () => {
      mockPrismaService.invoiceTemplate.findUnique.mockResolvedValue({
        id: '1',
        variables: [],
      });
      mockPrismaService.invoiceTemplate.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');

      expect(result).toHaveProperty('id', '1');
    });
  });

  describe('duplicate', () => {
    it('should duplicate an invoice template', async () => {
      mockPrismaService.invoiceTemplate.findUnique.mockResolvedValue({
        id: '1',
        name: 'Template',
        userId: '123',
        variables: [],
      });
      mockPrismaService.invoiceTemplate.create.mockResolvedValue({
        id: '2',
        variables: [],
      });

      const result = await service.duplicate('1');

      expect(result).toHaveProperty('id', '2');
      expect(generateCopyNameUtil.generateCopyName).toHaveBeenCalled();
    });
  });
});
