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

const mockContract = {
  id: 'contract-id',
  userId: 'user-id',
  templateId: 'template-id',
  clientId: 'client-id',
  quoteId: 'quote-id',
  invoiceId: null, 
  number: 1,
  status: ContractStatus.draft,
  generatedHtml: '<p>Hello</p>',
  validUntil: new Date(),
  issuedAt: null,
  pdfKey: 'pdf-key',
  previewKey: 'preview-key',
  createdAt: new Date(),
  updatedAt: new Date(),
  docusignEnvelopeId: null,
  variableValues: [],
};

describe('ContractService', () => {
  let service: ContractService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: PrismaService,
          useValue: {
            contract: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            $transaction: jest.fn().mockImplementation((cb) => cb({
              contractVariableValue: {
                deleteMany: jest.fn(),
                createMany: jest.fn(),
              },
              contract: {
                update: jest.fn().mockResolvedValue(mockContract),
              },
            })),
          },
        },
        { provide: UserService, useValue: { getUserOrThrow: jest.fn().mockResolvedValue({ email: 'user@example.com' }) } },
        { provide: ClientService, useValue: { getClientOrThrow: jest.fn().mockResolvedValue({ firstName: 'Jane', lastName: 'Doe', email: 'client@example.com' }) } },
        { provide: ContractTemplateService, useValue: { findOne: jest.fn().mockResolvedValue({ id: 'template-id', variables: [] }) } },
        {
          provide: PdfGeneratorService,
          useValue: {
            generatePdfAndPreview: jest.fn().mockResolvedValue({
              pdfBuffer: Buffer.from('pdf'),
              previewBuffer: Buffer.from('preview'),
            }),
            generateFromHtml: jest.fn().mockResolvedValue(Buffer.from('pdf')),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadDocumentAssets: jest.fn().mockResolvedValue({
              pdfKey: 'pdf-key',
              previewKey: 'preview-key',
            }),
            generateSignedUrl: jest.fn().mockResolvedValue('signed-url'),
            getFileBuffer: jest.fn().mockResolvedValue(Buffer.from('pdf')),
            deleteFile: jest.fn(),
          },
        },
        {
          provide: DocuSignService,
          useValue: {
            sendContractForSignature: jest.fn().mockResolvedValue('envelope-id'),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendContractSignedEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ContractService>(ContractService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return contract from findOne', async () => {
    jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(mockContract);
    const result = await service.findOne('contract-id', 'user-id');
    expect(result.id).toBe('contract-id');
  });

  it('should throw if contract not found in findOne', async () => {
    jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(null);
    await expect(service.findOne('contract-id', 'user-id')).rejects.toThrow(NotFoundException);
  });

  it('should delete a contract in remove', async () => {
    jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(mockContract);
    jest.spyOn(prisma.contract, 'delete').mockResolvedValue(mockContract);
    const result = await service.remove('contract-id', 'user-id');
    expect(result.id).toBe('contract-id');
  });

  it('should throw on invalid status change', async () => {
    jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue({ ...mockContract, status: ContractStatus.signed });
    await expect(service.changeStatus('contract-id', 'user-id', ContractStatus.sent)).rejects.toThrow(BadRequestException);
  });

  it('should allow valid status change', async () => {
    jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue({ ...mockContract, status: ContractStatus.draft });
    jest.spyOn(prisma.contract, 'update').mockResolvedValue({ ...mockContract, status: ContractStatus.sent });
    const result = await service.changeStatus('contract-id', 'user-id', ContractStatus.sent);
    expect(result.status).toBe(ContractStatus.sent);
  });

  it('should create a contract', async () => {
    const dto = { userId: 'user-id', clientId: 'client-id',templateId: 'template-id',generatedHtml: '<p></p>',validUntil: new Date(),variableValues: [],quoteId: null,};    
    jest.spyOn(prisma.contract, 'create').mockResolvedValue(mockContract);
    const result = await service.create('user-id', dto);
    expect(result.id).toBe('contract-id');
  });

  it('should update a contract', async () => {
    const dto = { generatedHtml: '<p>Updated</p>', variableValues: [] };
    jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue(mockContract);
    const result = await service.update('contract-id', 'user-id', dto);
    expect(result.id).toBe('contract-id');
  });

  it('should send for signature', async () => {
    jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue({ ...mockContract, status: ContractStatus.draft });
    const result = await service.sendForSignature('contract-id', 'user-id');
    expect(result.email).toBe('client@example.com');
  });

  it('should send signed contract to client', async () => {
    jest.spyOn(prisma.contract, 'findFirst').mockResolvedValue({ ...mockContract, status: ContractStatus.signed });
    const result = await service.sendSignedContractToClient('contract-id', 'user-id');
    expect(result.email).toBe('client@example.com');
  });
});
