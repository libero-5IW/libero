import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceTemplateService } from 'src/resources/invoice-template/invoice-template.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserService } from 'src/resources/user/user.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockTemplate = {
  id: 'template-id',
  name: 'Template A',
  contentHtml: '<p>Template</p>',
  pdfKey: 'pdf-key',
  previewKey: 'preview-key',
  userId: 'user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  variables: [{ variableName: 'nom', label: 'Nom', type: 'text', required: true }],
};

describe('InvoiceTemplateService', () => {
  let service: InvoiceTemplateService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceTemplateService,
        {
          provide: PrismaService,
          useValue: {
            invoiceTemplate: {
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
            },
            invoiceTemplateVariable: {
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
            $transaction: jest.fn().mockImplementation((cb) => cb({
              invoiceTemplateVariable: {
                deleteMany: jest.fn(),
                createMany: jest.fn(),
              },
              invoiceTemplate: {
                update: jest.fn().mockResolvedValue(mockTemplate),
              },
            })),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserOrThrow: jest.fn().mockResolvedValue({ email: 'user@example.com' }),
          },
        },
        {
          provide: PdfGeneratorService,
          useValue: {
            generatePdfAndPreview: jest.fn().mockResolvedValue({
              pdfBuffer: Buffer.from('pdf'),
              previewBuffer: Buffer.from('preview'),
            }),
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
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvoiceTemplateService>(InvoiceTemplateService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create an invoice template', async () => {
    jest.spyOn(prisma.invoiceTemplate, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prisma.invoiceTemplate, 'create').mockResolvedValue(mockTemplate);

    const result = await service.create('user-id', {
      name: 'Template A',
      contentHtml: '<p>Template</p>',
      variables: [
        {
          variableName: 'nom',
          label: 'Nom',
          type: 'text',
          required: true,
        },
      ],
    });

    expect(result.name).toBe('Template A');
  });

  it('should throw when template with same name exists', async () => {
    jest.spyOn(prisma.invoiceTemplate, 'findFirst').mockResolvedValue(mockTemplate);
    await expect(
      service.create('user-id', {
        name: 'Template A',
        contentHtml: '<p>Template</p>',
        variables: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should update an invoice template', async () => {
    jest.spyOn(prisma.invoiceTemplate, 'findFirst').mockResolvedValue(mockTemplate);
    const result = await service.update('template-id', 'user-id', {
      name: 'Template Updated',
      contentHtml: '<p>Updated</p>',
      variables: [],
    });
    expect(result.name).toBe('Template A');
  });

  it('should delete a template', async () => {
    jest.spyOn(prisma.invoiceTemplate, 'findFirst').mockResolvedValue(mockTemplate);
    jest.spyOn(prisma.invoiceTemplate, 'delete').mockResolvedValue(mockTemplate);
    const result = await service.remove('template-id', 'user-id');
    expect(result.id).toBe('template-id');
  });

  it('should duplicate a template', async () => {
    jest.spyOn(prisma.invoiceTemplate, 'findFirst').mockResolvedValue(mockTemplate);
    jest.spyOn(prisma.invoiceTemplate, 'create').mockResolvedValue({ ...mockTemplate, id: 'copy-id' });
    const result = await service.duplicate('template-id', 'user-id');
    expect(result.id).toBe('copy-id');
  });

  it('should throw on not found in findOne', async () => {
    jest.spyOn(prisma.invoiceTemplate, 'findFirst').mockResolvedValue(null);
    await expect(service.findOne('x', 'user-id')).rejects.toThrow(NotFoundException);
  });
});
