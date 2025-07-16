import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from 'src/resources/contract/contract.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { ClientService } from 'src/resources/client/client.service';
import { ContractTemplateService } from 'src/resources/contract-template/contract-template.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { DocuSignService } from 'src/resources/contract/docusign/docusign.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { ContractStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const prismaMock = {
  contract: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
  contractVariableValue: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
};
const userServiceMock = { getUserOrThrow: jest.fn() };
const clientServiceMock = { getClientOrThrow: jest.fn() };
const contractTemplateServiceMock = { findOne: jest.fn() };
const pdfGeneratorServiceMock = { generatePdfAndPreview: jest.fn(), generateFromHtml: jest.fn() };
const s3ServiceMock = {
  uploadDocumentAssets: jest.fn(),
  generateSignedUrl: jest.fn(),
  deleteFile: jest.fn(),
  getFileBuffer: jest.fn(),
};
const docusignServiceMock = { sendContractForSignature: jest.fn() };
const mailerServiceMock = {
  sendContractSignedEmail: jest.fn(),
};

jest.mock('src/common/utils/generate-number.util', () => ({
  generateNextNumber: jest.fn(() => 'CTR-001'),
}));
jest.mock('src/common/utils/buildSearchQuery.util', () => ({
  buildSearchQuery: jest.fn(() => ({ userId: 'user1' })),
}));
jest.mock('src/common/utils/csv-export.util', () => ({
  generateCSVExport: jest.fn(() => ({ filename: 'export.csv', content: 'csvdata' })),
}));

const user = { id: 'user1', email: 'test@mail.com', firstName: 'Sarah', lastName: 'Salamani' };
const client = { id: 'client1', firstName: 'Jean', lastName: 'Dupont', email: 'client@mail.com' };
const template = { id: 'template1', variables: [] };
const contract = {
  id: 'ctr1',
  userId: 'user1',
  clientId: 'client1',
  templateId: 'template1',
  number: 'CTR-001',
  status: ContractStatus.draft,
  generatedHtml: '<html></html>',
  validUntil: new Date(),
  issuedAt: null,
  pdfKey: 'pdfkey',
  previewKey: 'previewkey',
  variableValues: [],
  createdAt: new Date(),
};

describe('ContractService', () => {
  let service: ContractService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ClientService, useValue: clientServiceMock },
        { provide: ContractTemplateService, useValue: contractTemplateServiceMock },
        { provide: PdfGeneratorService, useValue: pdfGeneratorServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: DocuSignService, useValue: docusignServiceMock },
        { provide: MailerService, useValue: mailerServiceMock },
      ],
    }).compile();
    service = module.get<ContractService>(ContractService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crée un contrat avec succès', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      clientServiceMock.getClientOrThrow.mockResolvedValue(client);
      contractTemplateServiceMock.findOne.mockResolvedValue({ ...template, variables: [] });
      pdfGeneratorServiceMock.generatePdfAndPreview.mockResolvedValue({ pdfBuffer: Buffer.from('pdf'), previewBuffer: Buffer.from('preview') });
      s3ServiceMock.uploadDocumentAssets.mockResolvedValue({ pdfKey: 'pdfkey', previewKey: 'previewkey' });
      prismaMock.contract.create.mockResolvedValue({ ...contract });

      const dto = { clientId: 'client1', templateId: 'template1', generatedHtml: '<html></html>', validUntil: new Date(), variableValues: [] };
      const result = await service.create('user1', dto as any);
      expect(result.number).toBeNaN();
      expect(prismaMock.contract.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retourne tous les contrats avec URLs', async () => {
      prismaMock.contract.findMany.mockResolvedValue([contract]);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      const result = await service.findAll('user1');
      expect(result[0].pdfUrl).toBe('url');
      expect(result[0].previewUrl).toBe('url');
    });
  });

  describe('findOne', () => {
    it('retourne un contrat par id', async () => {
      prismaMock.contract.findFirst.mockResolvedValue(contract);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      const result = await service.findOne('ctr1', 'user1');
      expect(result.id).toBe('ctr1');
      expect(result.pdfUrl).toBe('url');
    });
    it('lève une exception si le contrat est absent', async () => {
      prismaMock.contract.findFirst.mockResolvedValue(null);
      await expect(service.findOne('ctr2', 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('met à jour un contrat en brouillon', async () => {
      prismaMock.contract.findFirst.mockResolvedValue({ ...contract, status: ContractStatus.draft });
      contractTemplateServiceMock.findOne.mockResolvedValue(template);
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      s3ServiceMock.deleteFile.mockResolvedValue(undefined);
      pdfGeneratorServiceMock.generatePdfAndPreview.mockResolvedValue({ pdfBuffer: Buffer.from('pdf'), previewBuffer: Buffer.from('preview') });
      s3ServiceMock.uploadDocumentAssets.mockResolvedValue({ pdfKey: 'pdfkey', previewKey: 'previewkey' });
      prismaMock.$transaction.mockImplementation(async (cb) => cb({ ...prismaMock }));
      prismaMock.contract.update.mockResolvedValue({ ...contract });
      prismaMock.contractVariableValue.deleteMany.mockResolvedValue(undefined);
      prismaMock.contractVariableValue.createMany.mockResolvedValue(undefined);
      const dto = { generatedHtml: '<html></html>', variableValues: [] };
      const result = await service.update('ctr1', 'user1', dto as any);
      expect(result.number).toBeNaN();
    });
    it('lève une erreur si le contrat n’est pas en brouillon', async () => {
      prismaMock.contract.findFirst.mockResolvedValue({ ...contract, status: ContractStatus.sent });
      await expect(service.update('ctr1', 'user1', { generatedHtml: '<html></html>' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('supprime un contrat', async () => {
      prismaMock.contract.findFirst.mockResolvedValue(contract);
      s3ServiceMock.deleteFile.mockResolvedValue(undefined);
      prismaMock.contract.delete.mockResolvedValue(contract);
      const result = await service.remove('ctr1', 'user1');
      expect(result.id).toBe('ctr1');
    });
  });

  describe('getNextContractNumber', () => {
    it('retourne le prochain numéro', async () => {
      const result = await service.getNextContractNumber('user1');
      expect(result).toBe('CTR-001');
    });
  });

  describe('search', () => {
    it('retourne les contrats filtrés', async () => {
      prismaMock.contract.findMany.mockResolvedValue([contract]);
      prismaMock.contract.count.mockResolvedValue(1);
      s3ServiceMock.generateSignedUrl.mockResolvedValue('url');
      prismaMock.$transaction.mockImplementation((arr) => Promise.all(arr.map((fn) => fn)));
      const result = await service.search('user1', '', ContractStatus.draft);
      expect(result.contract.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('exportToCSV', () => {
    it('exporte les contrats en CSV', async () => {
      jest.spyOn(service, 'search').mockResolvedValue({ contract: [contract], total: 1 } as any);
      const result = await service.exportToCSV('user1', '', ContractStatus.draft);
      expect(result.filename).toBe('export.csv');
      expect(result.content).toBe('csvdata');
    });
  });

  describe('changeStatus', () => {
    it('change le statut du contrat', async () => {
      prismaMock.contract.findFirst.mockResolvedValue({ ...contract, status: ContractStatus.draft });
      prismaMock.contract.update.mockResolvedValue({ ...contract, status: ContractStatus.sent });
      const result = await service.changeStatus('ctr1', 'user1', ContractStatus.sent);
      expect(result.status).toBe(ContractStatus.sent);
    });
    it('refuse une transition non autorisée', async () => {
      prismaMock.contract.findFirst.mockResolvedValue({ ...contract, status: ContractStatus.draft });
      await expect(service.changeStatus('ctr1', 'user1', ContractStatus.signed)).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendForSignature', () => {
    it('envoie le contrat pour signature', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      prismaMock.contract.findFirst.mockResolvedValue({ ...contract, status: ContractStatus.draft });
      clientServiceMock.getClientOrThrow.mockResolvedValue(client);
      jest.spyOn(service, 'changeStatus').mockResolvedValue({ ...contract, status: ContractStatus.sent, generatedHtml: '<html></html>' } as any);
      pdfGeneratorServiceMock.generateFromHtml.mockResolvedValue(Buffer.from('pdf'));
      docusignServiceMock.sendContractForSignature.mockResolvedValue('envelopeId');
      prismaMock.contract.update.mockResolvedValue({ ...contract });
      const result = await service.sendForSignature('ctr1', 'user1');
      expect(result.email).toBe('client@mail.com');
    });
  });

  describe('sendSignedContractToClient', () => {
    it('envoie le contrat signé au client', async () => {
      userServiceMock.getUserOrThrow.mockResolvedValue(user);
      prismaMock.contract.findFirst.mockResolvedValue({ ...contract, status: ContractStatus.signed });
      clientServiceMock.getClientOrThrow.mockResolvedValue(client);
      s3ServiceMock.getFileBuffer.mockResolvedValue(Buffer.from('pdf'));
      mailerServiceMock.sendContractSignedEmail.mockResolvedValue(undefined);
      const result = await service.sendSignedContractToClient('ctr1', 'user1');
      expect(result.email).toBe('client@mail.com');
    });
  });
});
