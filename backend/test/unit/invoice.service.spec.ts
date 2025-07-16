import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from '../../src/resources/invoice/invoice.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from '../../src/resources/user/user.service';
import { ClientService } from '../../src/resources/client/client.service';
import { InvoiceTemplateService } from '../../src/resources/invoice-template/invoice-template.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { InvoiceStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mocks
const prismaMock = {
  invoice: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
  invoiceVariableValue: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
};
const userServiceMock = { getUserOrThrow: jest.fn() };
const clientServiceMock = { getClientOrThrow: jest.fn() };
const invoiceTemplateServiceMock = { findOne: jest.fn() };
const pdfGeneratorServiceMock = { generatePdfAndPreview: jest.fn() };
const s3ServiceMock = {
  uploadDocumentAssets: jest.fn(),
  generateSignedUrl: jest.fn(),
  deleteFile: jest.fn(),
  getFileBuffer: jest.fn(),
};
const mailerServiceMock = {
  sendInvoiceToPayEmail: jest.fn(),
  sendInvoicePaidEmail: jest.fn(),
};

jest.mock('src/common/utils/generate-number.util', () => ({
  generateNextNumber: jest.fn(() => 'INV-001'),
}));
jest.mock('src/common/utils/buildSearchQuery.util', () => ({
  buildSearchQuery: jest.fn(() => ({ userId: 'user1' })),
}));
jest.mock('src/common/utils/csv-export.util', () => ({
  generateCSVExport: jest.fn(() => ({ filename: 'export.csv', content: 'csvdata' })),
}));

const user = { id: 'user1', email: 'test@mail.com' };
const client = { id: 'client1', firstName: 'Jean', lastName: 'Dupont', email: 'client@mail.com' };
const template = { id: 'template1', variables: [] };
const invoice = {
  id: 'inv1',
  userId: 'user1',
  clientId: 'client1',
  templateId: 'template1',
  number: 'INV-001',
  status: InvoiceStatus.draft,
  generatedHtml: '<html></html>',
  dueDate: new Date(),
  issuedAt: null,
  pdfKey: 'pdfkey',
  previewKey: 'previewkey',
  variableValues: [],
  createdAt: new Date(),
};

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ClientService, useValue: clientServiceMock },
        { provide: InvoiceTemplateService, useValue: invoiceTemplateServiceMock },
        { provide: PdfGeneratorService, useValue: pdfGeneratorServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: MailerService, useValue: mailerServiceMock },
      ],
    }).compile();
    service = module.get<InvoiceService>(InvoiceService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crée une facture avec succès', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      clientServiceMock.getClientOrThrow.mockResolvedValue(client);
      invoiceTemplateServiceMock.findOne.mockResolvedValue({ ...template, variables: [] });
      pdfGeneratorServiceMock.generatePdfAndPreview.mockResolvedValue({ pdfBuffer: Buffer.from('pdf'), previewBuffer: Buffer.from('preview') });
      s3ServiceMock.uploadDocumentAssets.mockResolvedValue({ pdfKey: 'pdfkey', previewKey: 'previewkey' });
      prismaMock.invoice.create.mockResolvedValue({ ...invoice });

      const dto = { clientId: 'client1', templateId: 'template1', generatedHtml: '<html></html>', dueDate: new Date(), variableValues: [] };
      const result = await service.create('user1', dto as any);
      expect(result.number).toBe('INV-001');
      expect(prismaMock.invoice.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retourne toutes les factures avec URLs', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([invoice]);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      const result = await service.findAll('user1');
      expect(result[0].pdfUrl).toBe('url');
      expect(result[0].previewUrl).toBe('url');
    });
  });

  describe('findOne', () => {
    it('retourne une facture par id', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue(invoice);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      const result = await service.findOne('inv1', 'user1');
      expect(result.id).toBe('inv1');
      expect(result.pdfUrl).toBe('url');
    });
    it('lève une exception si la facture est absente', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue(null);
      await expect(service.findOne('inv2', 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('met à jour une facture en brouillon', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue({ ...invoice, status: InvoiceStatus.draft });
      invoiceTemplateServiceMock.findOne.mockResolvedValue(template);
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      s3ServiceMock.deleteFile.mockResolvedValue(undefined);
      pdfGeneratorServiceMock.generatePdfAndPreview.mockResolvedValue({ pdfBuffer: Buffer.from('pdf'), previewBuffer: Buffer.from('preview') });
      s3ServiceMock.uploadDocumentAssets.mockResolvedValue({ pdfKey: 'pdfkey', previewKey: 'previewkey' });
      prismaMock.$transaction.mockImplementation(async (cb) => cb({ ...prismaMock }));
      prismaMock.invoice.update.mockResolvedValue({ ...invoice });
      prismaMock.invoiceVariableValue.deleteMany.mockResolvedValue(undefined);
      prismaMock.invoiceVariableValue.createMany.mockResolvedValue(undefined);
      const dto = { generatedHtml: '<html></html>', variableValues: [] };
      const result = await service.update('inv1', 'user1', dto as any);
      expect(result.number).toBeNaN();
    });
    it('lève une erreur si la facture n’est pas en brouillon', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue({ ...invoice, status: InvoiceStatus.sent });
      await expect(service.update('inv1', 'user1', { generatedHtml: '<html></html>' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('supprime une facture', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue(invoice);
      s3ServiceMock.deleteFile.mockResolvedValue(undefined);
      prismaMock.invoice.delete.mockResolvedValue(invoice);
      const result = await service.remove('inv1', 'user1');
      expect(result.id).toBe('inv1');
    });
  });

  describe('getNextInvoiceNumber', () => {
    it('retourne le prochain numéro', async () => {
      const result = await service.getNextInvoiceNumber('user1');
      expect(result).toBe('INV-001');
    });
  });

  describe('search', () => {
    it('retourne les factures filtrées', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([invoice]);
      prismaMock.invoice.count.mockResolvedValue(1);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      prismaMock.$transaction.mockImplementation((arr) => Promise.all(arr.map((fn) => fn)));
      const result = await service.search('user1', '', InvoiceStatus.draft);
      expect(result.invoice.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('exportToCSV', () => {
    it('exporte les factures en CSV', async () => {
      jest.spyOn(service, 'search').mockResolvedValue({ invoice: [invoice], total: 1 } as any);
      const result = await service.exportToCSV('user1', '', InvoiceStatus.draft);
      expect(result.filename).toBe('export.csv');
      expect(result.content).toBe('csvdata');
    });
  });

  describe('changeStatus', () => {
    it('change le statut de la facture', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue({ ...invoice, status: InvoiceStatus.draft });
      prismaMock.invoice.update.mockResolvedValue({ ...invoice, status: InvoiceStatus.sent });
      const result = await service.changeStatus('inv1', 'user1', 'test@mail.com', InvoiceStatus.sent);
      expect(result.status).toBe(InvoiceStatus.sent);
    });
    it('refuse une transition non autorisée', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue({ ...invoice, status: InvoiceStatus.draft });
      await expect(service.changeStatus('inv1', 'user1', 'test@mail.com', InvoiceStatus.paid)).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendInvoiceToClient', () => {
    it('envoie la facture au client', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      prismaMock.invoice.findFirst.mockResolvedValue({ ...invoice, status: InvoiceStatus.draft });
      clientServiceMock.getClientOrThrow.mockResolvedValue(client);
      s3ServiceMock.getFileBuffer.mockResolvedValue(Buffer.from('pdf'));
      mailerServiceMock.sendInvoiceToPayEmail.mockResolvedValue(undefined);
      jest.spyOn(service, 'changeStatus').mockResolvedValue({ ...invoice, status: InvoiceStatus.sent } as any);
      const result = await service.sendInvoiceToClient('inv1', 'user1');
      expect(result.email).toBe('client@mail.com');
    });
  });

  describe('sendPaidInvoiceToClient', () => {
    it('envoie la facture acquittée au client', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      prismaMock.invoice.findFirst.mockResolvedValue({ ...invoice, status: InvoiceStatus.sent });
      clientServiceMock.getClientOrThrow.mockResolvedValue(client);
      jest.spyOn(service, 'changeStatus').mockResolvedValue({ ...invoice, status: InvoiceStatus.paid, pdfKey: 'pdfkey' } as any);
      s3ServiceMock.getFileBuffer.mockResolvedValue(Buffer.from('pdf'));
      mailerServiceMock.sendInvoicePaidEmail.mockResolvedValue(undefined);
      const result = await service.sendPaidInvoiceToClient('inv1', 'user1');
      expect(result.email).toBe('client@mail.com');
    });
  });
}); 