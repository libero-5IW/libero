import { Test, TestingModule } from '@nestjs/testing';
import { QuoteTemplateService } from '../../src/resources/quote-template/quote-template.service';
import { PrismaService } from '../../src/database/prisma/prisma.service';
import { UserService } from '../../src/resources/user/user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as generateCopyNameUtil from '../../src/common/utils/generate-copy-name.util';

jest
  .spyOn(generateCopyNameUtil, 'generateCopyName')
  .mockResolvedValue('Template Copy');

const mockPrismaService = {
  quoteTemplate: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  quoteTemplateVariable: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrismaService)),
};

const mockUserService = {
  getUserOrThrow: jest.fn(),
};

describe('QuoteTemplateService', () => {
  let service: QuoteTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteTemplateService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<QuoteTemplateService>(QuoteTemplateService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new template', async () => {
      mockUserService.getUserOrThrow.mockResolvedValue(true);
      mockPrismaService.quoteTemplate.findFirst.mockResolvedValue(null);
      mockPrismaService.quoteTemplate.create.mockResolvedValue({
        id: '1',
        variables: [],
      });

      const dto = { name: 'Test', contentHtml: '<p>Test</p>', variables: [] };

      const result = await service.create(dto as any);

      expect(mockUserService.getUserOrThrow).toHaveBeenCalled();
      expect(mockPrismaService.quoteTemplate.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', '1');
    });

    it('should throw if template name exists', async () => {
      mockUserService.getUserOrThrow.mockResolvedValue(true);
      mockPrismaService.quoteTemplate.findFirst.mockResolvedValue({
        id: 'exists',
      });

      await expect(
        service.create({ name: 'Test', contentHtml: '' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all templates', async () => {
      mockPrismaService.quoteTemplate.findMany.mockResolvedValue([
        { id: '1', variables: [] },
      ]);
      const result = await service.findAll();
      expect(result.length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a template by id', async () => {
      mockPrismaService.quoteTemplate.findUnique.mockResolvedValue({
        id: '1',
        variables: [],
      });
      const result = await service.findOne('1');
      expect(result).toHaveProperty('id', '1');
    });

    it('should throw if not found', async () => {
      mockPrismaService.quoteTemplate.findUnique.mockResolvedValue(null);
      await expect(service.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a template', async () => {
      mockPrismaService.quoteTemplate.findUniqueOrThrow.mockResolvedValue({
        id: '1',
      });
      mockPrismaService.quoteTemplate.update.mockResolvedValue({
        id: '1',
        variables: [],
      });

      const result = await service.update('1', {
        name: 'Updated',
        contentHtml: '<p>Updated</p>',
      } as any);

      expect(result).toHaveProperty('id', '1');
    });
  });

  describe('remove', () => {
    it('should delete a template', async () => {
      mockPrismaService.quoteTemplate.findUnique.mockResolvedValue({
        id: '1',
        variables: [],
      });
      mockPrismaService.quoteTemplate.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');

      expect(result).toHaveProperty('id', '1');
    });
  });

  describe('duplicate', () => {
    it('should duplicate a template', async () => {
      mockPrismaService.quoteTemplate.findUnique.mockResolvedValue({
        id: '1',
        name: 'Template',
        userId: '123',
        variables: [],
      });
      mockPrismaService.quoteTemplate.create.mockResolvedValue({
        id: '2',
        variables: [],
      });

      const result = await service.duplicate('1');

      expect(result).toHaveProperty('id', '2');
      expect(generateCopyNameUtil.generateCopyName).toHaveBeenCalled();
    });
  });
});
