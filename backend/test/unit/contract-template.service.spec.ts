import { Test, TestingModule } from '@nestjs/testing';
import { ContractTemplateService } from 'src/resources/contract-template/contract-template.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const prismaMock = {
  contractTemplate: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
  contractTemplateVariable: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
};
const userServiceMock = { getUserOrThrow: jest.fn() };
const pdfGeneratorServiceMock = { generatePdfAndPreview: jest.fn() };
const s3ServiceMock = {
  uploadDocumentAssets: jest.fn(),
  generateSignedUrl: jest.fn(),
  deleteFile: jest.fn(),
};

jest.mock('src/common/utils/generate-copy-name.util', () => ({
  generateCopyName: jest.fn(async () => 'Template Copie'),
}));
jest.mock('src/common/utils/merge-system-variables.util', () => ({
  mergeSystemVariables: jest.fn((template) => template),
}));
jest.mock('src/common/utils/buildTemplateSearchQuery', () => ({
  buildTemplateSearchQuery: jest.fn(() => ({ userId: 'user1' })),
}));
jest.mock('src/common/utils/csv-export.util', () => ({
  generateCSVExport: jest.fn(() => ({ filename: 'export.csv', content: 'csvdata' })),
}));

const user = { id: 'user1', email: 'test@mail.com' };
const template = {
  id: 'tpl1',
  userId: 'user1',
  name: 'Template 1',
  contentHtml: '<html></html>',
  pdfKey: 'pdfkey',
  previewKey: 'previewkey',
  variables: [],
  createdAt: new Date(),
};

describe('ContractTemplateService', () => {
  let service: ContractTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractTemplateService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: PdfGeneratorService, useValue: pdfGeneratorServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
      ],
    }).compile();
    service = module.get<ContractTemplateService>(ContractTemplateService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crée un template avec succès', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      prismaMock.contractTemplate.findFirst.mockResolvedValue(null);
      pdfGeneratorServiceMock.generatePdfAndPreview.mockResolvedValue({ pdfBuffer: Buffer.from('pdf'), previewBuffer: Buffer.from('preview') });
      s3ServiceMock.uploadDocumentAssets.mockResolvedValue({ pdfKey: 'pdfkey', previewKey: 'previewkey' });
      prismaMock.contractTemplate.create.mockResolvedValue(template);
      const dto = { name: 'Template 1', contentHtml: '<html></html>', variables: [] };
      const result = await service.create('user1', dto as any);
      expect(result.name).toBe('Template 1');
      expect(prismaMock.contractTemplate.create).toHaveBeenCalled();
    });
    it('lève une erreur si nom déjà utilisé', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      prismaMock.contractTemplate.findFirst.mockResolvedValue(template);
      const dto = { name: 'Template 1', contentHtml: '<html></html>', variables: [] };
      await expect(service.create('user1', dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('retourne tous les templates', async () => {
      prismaMock.contractTemplate.findMany.mockResolvedValue([template]);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      const result = await service.findAll('user1', true);
      expect(result[0].name).toBe('Template 1');
    });
  });

  describe('findOne', () => {
    it('retourne un template par id', async () => {
      prismaMock.contractTemplate.findFirst.mockResolvedValue(template);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      const result = await service.findOne('tpl1', 'user1');
      expect(result.id).toBe('tpl1');
    });
    it('lève une erreur si le template est absent', async () => {
      prismaMock.contractTemplate.findFirst.mockResolvedValue(null);
      await expect(service.findOne('tpl2', 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('met à jour un template', async () => {
      prismaMock.contractTemplate.findFirst.mockResolvedValue(template);
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      s3ServiceMock.deleteFile.mockResolvedValue(undefined);
      pdfGeneratorServiceMock.generatePdfAndPreview.mockResolvedValue({ pdfBuffer: Buffer.from('pdf'), previewBuffer: Buffer.from('preview') });
      s3ServiceMock.uploadDocumentAssets.mockResolvedValue({ pdfKey: 'pdfkey', previewKey: 'previewkey' });
      prismaMock.$transaction.mockImplementation(async (cb) => cb({ ...prismaMock }));
      prismaMock.contractTemplate.update.mockResolvedValue({ ...template, name: 'Modifié' });
      prismaMock.contractTemplateVariable.deleteMany.mockResolvedValue(undefined);
      prismaMock.contractTemplateVariable.createMany.mockResolvedValue(undefined);
      const dto = { name: 'Modifié', contentHtml: '<html></html>', variables: [] };
      const result = await service.update('tpl1', 'user1', dto as any);
      expect(result.name).toBe('Modifié');
    });
    it('lève une erreur si le template est absent', async () => {
      prismaMock.contractTemplate.findFirst.mockResolvedValue(null);
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      const dto = { name: 'Modifié', contentHtml: '<html></html>', variables: [] };
      await expect(service.update('tpl2', 'user1', dto as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('supprime un template', async () => {
      prismaMock.contractTemplate.findFirst.mockResolvedValue(template);
      s3ServiceMock.deleteFile.mockResolvedValue(undefined);
      prismaMock.contractTemplate.delete.mockResolvedValue(template);
      const result = await service.remove('tpl1', 'user1');
      expect(result.id).toBe('tpl1');
    });
  });

  describe('duplicate', () => {
    it('duplique un template', async () => {
      prismaMock.contractTemplate.findFirst.mockResolvedValue(template);
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      pdfGeneratorServiceMock.generatePdfAndPreview.mockResolvedValue({ pdfBuffer: Buffer.from('pdf'), previewBuffer: Buffer.from('preview') });
      s3ServiceMock.uploadDocumentAssets.mockResolvedValue({ pdfKey: 'pdfkey', previewKey: 'previewkey' });
      prismaMock.contractTemplate.create.mockResolvedValue({ ...template, name: 'Template Copie' });
      const result = await service.duplicate('tpl1', 'user1');
      expect(result.name).toBe('Template Copie');
    });
  });

  describe('getDefaultTemplate', () => {
    it('retourne le template par défaut', async () => {
      prismaMock.contractTemplate.findUnique.mockResolvedValue(template);
      const result = await service.getDefaultTemplate();
      expect(result.id).toBe('tpl1');
    });
  });

  describe('search', () => {
    it('retourne les templates filtrés', async () => {
      prismaMock.contractTemplate.findMany.mockResolvedValue([template]);
      prismaMock.contractTemplate.count.mockResolvedValue(1);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      prismaMock.$transaction.mockImplementation((arr) => Promise.all(arr.map((fn) => fn)));
      const result = await service.search('user1', '', undefined, undefined);
      expect(result.contractTemplate.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('exportToCSV', () => {
    it('exporte les templates en CSV', async () => {
      jest.spyOn(service, 'search').mockResolvedValue({ contractTemplate: [template], total: 1 } as any);
      const result = await service.exportToCSV('user1', '');
      expect(result.filename).toBe('export.csv');
      expect(result.content).toBe('csvdata');
    });
  });
});
