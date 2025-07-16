import { Test, TestingModule } from '@nestjs/testing';
import { QuoteService } from 'src/resources/quote/quote.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { ClientService } from 'src/resources/client/client.service';
import { QuoteTemplateService } from 'src/resources/quote-template/quote-template.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { QuoteStatus } from '@prisma/client';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

const prismaMock = {
  quote: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
  quoteVariableValue: {
    update: jest.fn(),
  },
};
const userServiceMock = { getUserOrThrow: jest.fn() };
const clientServiceMock = { getClientOrThrow: jest.fn() };
const quoteTemplateServiceMock = { findOne: jest.fn() };
const pdfGeneratorServiceMock = { generatePdfAndPreview: jest.fn() };
const s3ServiceMock = {
  uploadDocumentAssets: jest.fn(),
  generateSignedUrl: jest.fn(),
  deleteFile: jest.fn(),
  getFileBuffer: jest.fn(),
};
const mailerServiceMock = {
  sendQuoteByEmail: jest.fn(),
};

jest.mock('src/common/utils/generate-number.util', () => ({
  generateNextNumber: jest.fn(() => 'QTE-001'),
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
const quote = {
  id: 'qte1',
  userId: 'user1',
  clientId: 'client1',
  templateId: 'template1',
  number: 'QTE-001',
  status: QuoteStatus.draft,
  generatedHtml: '<html></html>',
  validUntil: new Date(),
  issuedAt: null,
  pdfKey: 'pdfkey',
  previewKey: 'previewkey',
  variableValues: [],
  createdAt: new Date(),
};

describe('QuoteService', () => {
  let service: QuoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ClientService, useValue: clientServiceMock },
        { provide: QuoteTemplateService, useValue: quoteTemplateServiceMock },
        { provide: PdfGeneratorService, useValue: pdfGeneratorServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: MailerService, useValue: mailerServiceMock },
      ],
    }).compile();
    service = module.get<QuoteService>(QuoteService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crée un devis avec succès', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      clientServiceMock.getClientOrThrow.mockResolvedValue(client);
      quoteTemplateServiceMock.findOne.mockResolvedValue({ ...template, variables: [] });
      pdfGeneratorServiceMock.generatePdfAndPreview.mockResolvedValue({ pdfBuffer: Buffer.from('pdf'), previewBuffer: Buffer.from('preview') });
      s3ServiceMock.uploadDocumentAssets.mockResolvedValue({ pdfKey: 'pdfkey', previewKey: 'previewkey' });
      prismaMock.quote.create.mockResolvedValue({ ...quote });

      const dto = { clientId: 'client1', templateId: 'template1', generatedHtml: '<html></html>', validUntil: new Date(), variableValues: [] };
      const result = await service.create('user1', dto as any);
      expect(result.number).toBeNaN();
      expect(prismaMock.quote.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retourne tous les devis avec URLs', async () => {
      prismaMock.quote.findMany.mockResolvedValue([quote]);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      const result = await service.findAll('user1');
      expect(result[0].pdfUrl).toBe('url');
      expect(result[0].previewUrl).toBe('url');
    });
  });

  describe('findOne', () => {
    it('retourne un devis par id', async () => {
      prismaMock.quote.findFirst.mockResolvedValue(quote);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      const result = await service.findOne('qte1', 'user1');
      expect(result.id).toBe('qte1');
      expect(result.pdfUrl).toBe('url');
    });
    it('lève une exception si le devis est absent', async () => {
      prismaMock.quote.findFirst.mockResolvedValue(null);
      await expect(service.findOne('qte2', 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('met à jour un devis en brouillon', async () => {
      prismaMock.quote.findFirst.mockResolvedValue({ ...quote, status: QuoteStatus.draft });
      quoteTemplateServiceMock.findOne.mockResolvedValue(template);
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      s3ServiceMock.deleteFile.mockResolvedValue(undefined);
      pdfGeneratorServiceMock.generatePdfAndPreview.mockResolvedValue({ pdfBuffer: Buffer.from('pdf'), previewBuffer: Buffer.from('preview') });
      s3ServiceMock.uploadDocumentAssets.mockResolvedValue({ pdfKey: 'pdfkey', previewKey: 'previewkey' });
      prismaMock.quoteVariableValue.update.mockResolvedValue(undefined);
      prismaMock.quote.update.mockResolvedValue({ ...quote });
      const dto = { generatedHtml: '<html></html>', variableValues: [] };
      const result = await service.update('qte1', 'user1', dto as any);
      expect(result.number).toBeNaN();
    });
    it('lève une erreur si le devis n’est pas en brouillon', async () => {
      prismaMock.quote.findFirst.mockResolvedValue({ ...quote, status: QuoteStatus.sent });
      await expect(service.update('qte1', 'user1', { generatedHtml: '<html></html>' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('supprime un devis', async () => {
      prismaMock.quote.findFirst.mockResolvedValue(quote);
      s3ServiceMock.deleteFile.mockResolvedValue(undefined);
      prismaMock.quote.delete.mockResolvedValue(quote);
      const result = await service.remove('qte1', 'user1');
      expect(result.id).toBe('qte1');
    });
  });

  describe('getNextQuoteNumber', () => {
    it('retourne le prochain numéro', async () => {
      const result = await service.getNextQuoteNumber('user1');
      expect(result).toBe('QTE-001');
    });
  });

  describe('search', () => {
    it('retourne les devis filtrés', async () => {
      prismaMock.quote.findMany.mockResolvedValue([quote]);
      prismaMock.quote.count.mockResolvedValue(1);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      prismaMock.$transaction.mockImplementation((arr) => Promise.all(arr.map((fn) => fn)));
      const result = await service.search('user1', '', QuoteStatus.draft);
      expect(result.quote.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('exportToCSV', () => {
    it('exporte les devis en CSV', async () => {
      jest.spyOn(service, 'search').mockResolvedValue({ quote: [quote], total: 1 } as any);
      const result = await service.exportToCSV('user1', '', QuoteStatus.draft);
      expect(result.filename).toBe('export.csv');
      expect(result.content).toBe('csvdata');
    });
  });

  describe('changeStatus', () => {
    it('change le statut du devis', async () => {
      prismaMock.quote.findFirst.mockResolvedValue({ ...quote, status: QuoteStatus.draft });
      prismaMock.quote.update.mockResolvedValue({ ...quote, status: QuoteStatus.sent });
      const result = await service.changeStatus('qte1', 'user1', QuoteStatus.sent);
      expect(result.status).toBe(QuoteStatus.sent);
    });
    it('refuse une transition non autorisée', async () => {
      prismaMock.quote.findFirst.mockResolvedValue({ ...quote, status: QuoteStatus.draft });
      await expect(service.changeStatus('qte1', 'user1', QuoteStatus.accepted)).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendQuoteToClient', () => {
    it('envoie le devis au client', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      prismaMock.quote.findFirst.mockResolvedValue({ ...quote, status: QuoteStatus.draft });
      clientServiceMock.getClientOrThrow.mockResolvedValue(client);
      s3ServiceMock.getFileBuffer.mockResolvedValue(Buffer.from('pdf'));
      mailerServiceMock.sendQuoteByEmail.mockResolvedValue(undefined);
      jest.spyOn(service, 'changeStatus').mockResolvedValue({ ...quote, status: QuoteStatus.sent } as any);
      const result = await service.sendQuoteToClient('qte1', 'user1');
      expect(result.email).toBe('client@mail.com');
    });
  });

  describe('getPreviewSignedUrl', () => {
    it('retourne une url signée si le userId correspond', async () => {
      prismaMock.quote.findUnique.mockResolvedValue({ ...quote, userId: 'user1' });
      s3ServiceMock.generateSignedUrl.mockResolvedValue('signedurl');
      const result = await service.getPreviewSignedUrl('qte1', 'user1');
      expect(result).toBe('signedurl');
    });
    it('lève une erreur si le userId ne correspond pas', async () => {
      prismaMock.quote.findUnique.mockResolvedValue({ ...quote, userId: 'autre' });
      await expect(service.getPreviewSignedUrl('qte1', 'user1')).rejects.toThrow(ForbiddenException);
    });
  });
});
