import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from '../../src/resources/invoice/invoice.service';
import { PrismaService } from '../../src/database/prisma/prisma.service';
import { InvoiceTemplateService } from '../../src/resources/invoice-template/invoice-template.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  invoice: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockInvoiceTemplateService = {
  findOne: jest.fn(),
};

describe('InvoiceService', () => {
  let service: InvoiceService;

  const userId = 'test-user-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: InvoiceTemplateService,
          useValue: mockInvoiceTemplateService,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvoiceFromTemplate', () => {
    it('should create an invoice successfully', async () => {
      const dto = {
        templateId: 'tpl-1',
        clientId: 'client-1',
        userId: 'user-1',
        variables: { total_amount: '1000', freelancer_address: 'Paris' },
        issuedAt: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        generatedHtml: '<p>HTML</p>',
        status: 'draft',
      };

      mockInvoiceTemplateService.findOne.mockResolvedValue({
        id: 'tpl-1',
        variables: [
          { variableName: 'total_amount' },
          { variableName: 'freelancer_address' },
        ],
        contentHtml: '<p>{{total_amount}} - {{freelancer_address}}</p>',
      });

      mockPrismaService.invoice.findFirst.mockResolvedValue({ number: 5 });
      mockPrismaService.invoice.create.mockResolvedValue({
        id: 'inv-1',
        number: 6,
      });

      const result = await service.createInvoiceFromTemplate(dto, dto.userId);

      expect(mockInvoiceTemplateService.findOne).toHaveBeenCalledWith('tpl-1');
      expect(mockPrismaService.invoice.create).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 'inv-1', number: 6 });
    });

    it('should throw NotFoundException if template not found', async () => {
      mockInvoiceTemplateService.findOne.mockResolvedValue(null);

      await expect(
        service.createInvoiceFromTemplate(
          { templateId: 'invalid', variables: {} } as any,
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if variables are missing', async () => {
      mockInvoiceTemplateService.findOne.mockResolvedValue({
        id: 'tpl-1',
        variables: [{ variableName: 'total_amount' }],
        contentHtml: '<p>{{total_amount}}</p>',
      });

      await expect(
        service.createInvoiceFromTemplate(
          { templateId: 'tpl-1', variables: {} } as any,
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return invoice by id', async () => {
      mockPrismaService.invoice.findUnique.mockResolvedValue({ id: 'inv-1' });
      const result = await service.findById('inv-1');
      expect(result).toHaveProperty('id', 'inv-1');
    });

    it('should return null if invoice not found', async () => {
      mockPrismaService.invoice.findUnique.mockResolvedValue(null);
      const result = await service.findById('invalid');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all invoices', async () => {
      mockPrismaService.invoice.findMany.mockResolvedValue([{ id: 'inv-1' }]);
      const result = await service.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getNextInvoiceNumber', () => {
    it('should return next invoice number when invoices exist', async () => {
      mockPrismaService.invoice.findFirst.mockResolvedValue({ number: 10 });
      const result = await service.getNextInvoiceNumber(userId);
      expect(result).toEqual({ nextNumber: 11 });
    });

    it('should return 1 if no invoices exist', async () => {
      mockPrismaService.invoice.findFirst.mockResolvedValue(null);
      const result = await service.getNextInvoiceNumber(userId);
      expect(result).toEqual({ nextNumber: 1 });
    });
  });
});
